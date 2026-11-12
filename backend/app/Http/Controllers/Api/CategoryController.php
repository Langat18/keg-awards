<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Cycle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    public function index(Cycle $cycle)
    {
        return response()->json($cycle->categories);
    }

    public function store(Request $request, Cycle $cycle)
    {
        $category = $cycle->categories()->create($this->validated($request, $cycle));

        return response()->json($category, 201);
    }

    public function update(Request $request, Cycle $cycle, Category $category)
    {
        $category->update($this->validated($request, $cycle, $category));

        return response()->json($category);
    }

    public function destroy(Cycle $cycle, Category $category)
    {
        if ($cycle->phase === 'voting' || $cycle->phase === 'results') {
            return response()->json(['message' => 'Categories cannot be removed once voting has started.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Category removed.']);
    }

    private function validated(Request $request, Cycle $cycle, ?Category $category = null): array
    {
        $unique = Rule::unique('categories', 'name')->where('cycle_id', $cycle->id);

        if ($category) {
            $unique->ignore($category->id);
        }

        $data = $request->validate([
            'name' => [$category ? 'sometimes' : 'required', 'string', 'max:150', $unique],
            'description' => 'nullable|string',
            'criteria' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0|max:32000',
        ], [
            'name.unique' => 'This cycle already has a category with that name.',
        ]);

        if (array_key_exists('sort_order', $data) && $data['sort_order'] === null) {
            $data['sort_order'] = $category ? $category->sort_order : 0;
        }

        return $data;
    }
}
