import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

interface Repo { fullName: string; name: string; owner: string; private: boolean; defaultBranch: string; }
interface Props { isOpen: boolean; onClose: () => void; content: string; suggestedFilename?: string; label?: string; }

export function GitHubPushModal({ isOpen, onClose, content, suggestedFilename = 'code.txt', label = 'code' }: Props) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [branch, setBranch] = useState('');
  const [filePath, setFilePath] = useState(suggestedFilename);
  const [commitMsg, setCommitMsg] = useState(`Add ${label} via Transpiler`);
  const [loading, setLoading] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setReposLoading(true); setError(''); setSuccess(null);
    setSelectedRepo(null); setBranches([]); setBranch('');
    setFilePath(suggestedFilename); setCommitMsg(`Add ${label} via Transpiler`); setRepoSearch('');
    api<Repo[]>('/github/repos').then(setRepos).catch(() => setError('Failed to load repos. Connect GitHub in Settings first.')).finally(() => setReposLoading(false));
  }, [isOpen]);

  const selectRepo = useCallback(async (repo: Repo) => {
    setSelectedRepo(repo); setBranch(repo.defaultBranch); setBranchesLoading(true);
    try { setBranches(await api<string[]>(`/github/repos/${repo.owner}/${repo.name}/branches`)); }
    catch { setBranches([repo.defaultBranch]); }
    finally { setBranchesLoading(false); }
  }, []);

  const handlePush = async () => {
    if (!selectedRepo || !branch || !filePath.trim() || !commitMsg.trim()) return;
    setLoading(true); setError('');
    try {
      const result = await api<{ success: boolean; url: string }>('/github/push', {
        method: 'POST',
        body: { owner: selectedRepo.owner, repo: selectedRepo.name, branch, path: filePath.trim(), content, message: commitMsg.trim() },
      });
      setSuccess(result.url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Push failed'); }
    finally { setLoading(false); }
  };

  const GH = () => <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>;
  const filtered = repos.filter(r => r.fullName.toLowerCase().includes(repoSearch.toLowerCase()));

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5"><GH /><h2 className="font-semibold text-white">Push to GitHub</h2></div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-white font-medium">Pushed successfully!</p>
              <a href={success} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 text-sm underline">View on GitHub →</a>
              <div className="pt-2"><button onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm rounded-lg transition">Close</button></div>
            </div>
          ) : (
            <>
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Repository</label>
                {selectedRepo ? (
                  <div className="flex items-center justify-between bg-gray-800 border border-indigo-500/50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs">{selectedRepo.private ? '🔒' : '🌐'}</span>
                      <span className="text-white font-medium">{selectedRepo.fullName}</span>
                    </div>
                    <button onClick={() => { setSelectedRepo(null); setBranches([]); setBranch(''); }} className="text-xs text-gray-500 hover:text-gray-300">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input value={repoSearch} onChange={e => setRepoSearch(e.target.value)} placeholder="Search repositories…"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"/>
                    <div className="max-h-44 overflow-y-auto rounded-lg border border-gray-700 divide-y divide-gray-800">
                      {reposLoading ? <p className="text-sm text-gray-500 px-3 py-3 text-center">Loading repos…</p>
                        : filtered.length === 0 ? <p className="text-sm text-gray-500 px-3 py-3 text-center">No repos found</p>
                        : filtered.map(r => (
                          <button key={r.fullName} onClick={() => selectRepo(r)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-800/80 transition text-sm">
                            <span className="text-xs">{r.private ? '🔒' : '🌐'}</span>
                            <span className="text-white">{r.fullName}</span>
                            <span className="ml-auto text-xs text-gray-500">{r.defaultBranch}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedRepo && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Branch</label>
                  {branchesLoading
                    ? <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-500">Loading…</div>
                    : <select value={branch} onChange={e => setBranch(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition">
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>}
                </div>
              )}
              {selectedRepo && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">File path</label>
                  <input value={filePath} onChange={e => setFilePath(e.target.value)} placeholder="e.g. src/output.py"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition font-mono"/>
                  <p className="text-xs text-gray-500 mt-1">File will be created or updated automatically.</p>
                </div>
              )}
              {selectedRepo && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Commit message</label>
                  <input value={commitMsg} onChange={e => setCommitMsg(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition"/>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition">Cancel</button>
                <button onClick={handlePush} disabled={loading || !selectedRepo || !branch || !filePath.trim() || !commitMsg.trim()}
                  className="px-5 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
                  {loading ? <><svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Pushing…</>
                    : <><GH />Push to GitHub</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
