<?php

namespace App\Support;

use App\Models\StaffMember;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StaffImport
{
    public const FIELDS = ['name', 'department', 'email', 'pf_number'];

    private const LABELS = [
        'name' => 'Name',
        'department' => 'Department',
        'email' => 'Email',
        'pf_number' => 'PF number',
    ];

    public function __construct(private array $rows, private bool $markMissingAsLeft = false)
    {
    }

    public function analyse(): array
    {
        $existing = StaffMember::with('user:id,is_active')->get();
        $byEmail = $existing->whereNotNull('email')->keyBy('email');
        $byPf = $existing->whereNotNull('pf_number')->keyBy('pf_number');
        $byNameDept = $existing->groupBy(fn ($s) => $this->nameKey($s->name, $s->department));

        $seenEmail = [];
        $seenPf = [];
        $seenNameDept = [];
        $matchedBy = [];
        $protected = [];
        $results = [];

        foreach (array_values($this->rows) as $i => $raw) {
            $row = $this->clean($raw, $i);
            $line = $row['line'];
            $error = $this->validate($row);

            $matchE = $row['email'] ? $byEmail->get($row['email']) : null;
            $matchP = $row['pf_number'] ? $byPf->get($row['pf_number']) : null;

            foreach ([$matchE, $matchP] as $m) {
                if ($m) {
                    $protected[$m->id] = true;
                }
            }

            if (! $error && $row['email'] && isset($seenEmail[$row['email']])) {
                $error = "Same email as line {$seenEmail[$row['email']]}.";
            }
            if (! $error && $row['pf_number'] && isset($seenPf[$row['pf_number']])) {
                $error = "Same PF number as line {$seenPf[$row['pf_number']]}.";
            }
            if (! $error && $matchE && $matchP && $matchE->id !== $matchP->id) {
                $error = "The email belongs to {$matchE->name} but the PF number belongs to {$matchP->name}.";
            }

            $match = $matchE ?? $matchP;

            if (! $error && $match && isset($matchedBy[$match->id])) {
                $error = "Same person as line {$matchedBy[$match->id]}.";
            }

            if ($error) {
                $results[] = $row + ['action' => 'error', 'message' => $error];

                continue;
            }

            if ($row['email']) {
                $seenEmail[$row['email']] = $line;
            }
            if ($row['pf_number']) {
                $seenPf[$row['pf_number']] = $line;
            }

            if ($match) {
                $matchedBy[$match->id] = $line;
                $changes = [];

                foreach (self::FIELDS as $field) {
                    if ($row[$field] !== null && $row[$field] !== $match->{$field}) {
                        $changes[] = ['field' => self::LABELS[$field], 'from' => $match->{$field}, 'to' => $row[$field]];
                    }
                }

                $returning = $match->hasLeft();

                $results[] = $row + [
                    'action' => ($changes || $returning) ? 'update' : 'unchanged',
                    'staff_id' => $match->id,
                    'changes' => $changes,
                    'returning' => $returning,
                ];

                continue;
            }

            $key = $this->nameKey($row['name'], $row['department']);
            $similar = $byNameDept->get($key, collect())->reject(fn ($s) => isset($matchedBy[$s->id]))->first();

            if ($similar) {
                $results[] = $row + ['action' => 'flagged', 'message' => "Same name and department as {$similar->name}, already on the list."];
            } elseif (isset($seenNameDept[$key])) {
                $results[] = $row + ['action' => 'flagged', 'message' => "Same name and department as line {$seenNameDept[$key]}."];
            } else {
                $results[] = $row + ['action' => 'new'];
            }

            $seenNameDept[$key] ??= $line;
        }

        $leaving = $this->markMissingAsLeft
            ? $existing
                ->filter(fn ($s) => ! $s->hasLeft() && ! isset($matchedBy[$s->id]) && ! isset($protected[$s->id]))
                ->map(fn ($s) => [
                    'staff_id' => $s->id,
                    'name' => $s->name,
                    'department' => $s->department,
                    'email' => $s->email,
                    'registered' => $s->user_id !== null,
                ])
                ->values()
                ->all()
            : [];

        $grouped = collect($results)->groupBy('action');

        return [
            'rows' => $results,
            'leaving' => $leaving,
            'counts' => [
                'new' => $grouped->get('new', collect())->count(),
                'update' => $grouped->get('update', collect())->count(),
                'unchanged' => $grouped->get('unchanged', collect())->count(),
                'flagged' => $grouped->get('flagged', collect())->count(),
                'error' => $grouped->get('error', collect())->count(),
                'leaving' => count($leaving),
            ],
        ];
    }

    public function apply(array $includeFlaggedLines = []): array
    {
        return DB::transaction(function () use ($includeFlaggedLines) {
            $analysis = $this->analyse();
            $include = array_flip($includeFlaggedLines);
            $added = $updated = $left = 0;

            foreach ($analysis['rows'] as $row) {
                $values = collect($row)->only(self::FIELDS);

                if ($row['action'] === 'new' || ($row['action'] === 'flagged' && isset($include[$row['line']]))) {
                    StaffMember::create($values->all());
                    $added++;
                }

                if ($row['action'] === 'update') {
                    $member = StaffMember::with('user')->find($row['staff_id']);
                    $member->fill($values->filter(fn ($v) => $v !== null)->all());

                    if ($row['returning']) {
                        $member->left_at = null;
                        $member->user?->update(['is_active' => true]);
                    }

                    $member->save();
                    $updated++;
                }
            }

            foreach ($analysis['leaving'] as $person) {
                $member = StaffMember::with('user')->find($person['staff_id']);
                $member->update(['left_at' => now()]);

                if ($member->user) {
                    $member->user->update(['is_active' => false]);
                    $member->user->tokens()->delete();
                }
                $left++;
            }

            return compact('added', 'updated', 'left');
        });
    }

    private function clean(mixed $raw, int $index): array
    {
        $raw = is_array($raw) ? $raw : [];
        $line = isset($raw['line']) && is_numeric($raw['line']) ? (int) $raw['line'] : $index + 1;

        return [
            'line' => $line,
            'name' => StaffMember::cleanName($this->text($raw, 'name')),
            'department' => StaffMember::cleanName($this->text($raw, 'department')),
            'email' => StaffMember::cleanEmail($this->text($raw, 'email')),
            'pf_number' => StaffMember::cleanPf($this->text($raw, 'pf_number')),
        ];
    }

    private function text(array $raw, string $key): ?string
    {
        $value = $raw[$key] ?? null;

        return is_scalar($value) ? (string) $value : null;
    }

    private function validate(array $row): ?string
    {
        if (! $row['name']) {
            return 'Name is missing.';
        }
        if (mb_strlen($row['name']) > 150 || mb_strlen((string) $row['department']) > 150) {
            return 'Name or department is longer than 150 characters.';
        }
        if ($row['email'] && (mb_strlen($row['email']) > 150 || ! filter_var($row['email'], FILTER_VALIDATE_EMAIL))) {
            return "\"{$row['email']}\" is not a valid email address.";
        }
        if ($row['pf_number'] && mb_strlen($row['pf_number']) > 50) {
            return 'PF number is longer than 50 characters.';
        }

        return null;
    }

    private function nameKey(?string $name, ?string $department): string
    {
        return Str::lower((string) $name).'|'.Str::lower((string) $department);
    }
}
