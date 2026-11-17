import { useState } from 'react';
import { downloadCredentials, printSlips } from '../../lib/credentials';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/Dialog';
import Button from '../../components/Button';
import Dialog from '../../components/Dialog';
import Icon from '../../components/Icon';

export default function CredentialsDialog({ credentials, title, onClose }) {
  const { toast } = useToast();
  const confirm = useConfirm();
  const [saved, setSaved] = useState(false);
  const open = Boolean(credentials?.length);

  async function download() {
    await downloadCredentials(credentials);
    setSaved(true);
  }

  function print() {
    if (printSlips(credentials)) setSaved(true);
    else toast.error('The print window was blocked. Allow pop-ups for this site, or download the sheet instead.');
  }

  async function close() {
    if (!saved) {
      const ok = await confirm({
        title: 'Close without saving?',
        message: 'These temporary passwords will not be shown again. If you close now you will need to reset them.',
        confirmLabel: 'Close anyway',
        danger: true,
      });
      if (!ok) return;
    }
    setSaved(false);
    onClose();
  }

  return (
    <Dialog
      open={open}
      title={title}
      onClose={close}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={close}>Done</Button>
          <Button variant="secondary" icon="download" onClick={download}>Download sheet</Button>
          <Button icon="printer" onClick={print}>Print slips</Button>
        </>
      }
    >
      <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-amber-900">
        <Icon name="alert" className="mt-0.5 h-4 w-4" />
        Hand these over privately. The temporary passwords are shown only now, and each person must choose their own when they first sign in.
      </p>

      <div className="mt-4 max-h-[50vh] overflow-auto rounded-lg border border-line">
        <table className="w-full text-left text-sm text-brand-ink">
          <thead className="sticky top-0 bg-canvas text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Sign-in ID</th>
              <th className="px-3 py-2 font-semibold">Temporary password</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {credentials?.map(c => (
              <tr key={c.login_id}>
                <td className="px-3 py-2">
                  <p className="font-semibold">{c.name}</p>
                  {c.email && <p className="text-xs text-muted">{c.email}</p>}
                </td>
                <td className="px-3 py-2 font-mono">{c.login_id}</td>
                <td className="px-3 py-2 font-mono font-semibold tracking-wide">{c.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
