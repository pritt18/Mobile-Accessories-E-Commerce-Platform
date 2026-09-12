import React, { useState, useEffect } from 'react';
import { FileText, MessageSquare, Edit3, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';

export const CMSAdmin = () => {
  const [pages, setPages] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit page modal
  const [editingPage, setEditingPage] = useState(null);
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, eRes] = await Promise.all([
        api.get('/admin/cms'),
        api.get('/admin/enquiries'),
      ]);
      if (pRes.data?.success) setPages(pRes.data.data);
      if (eRes.data?.success) setEnquiries(eRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEditPage = (page) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageContent(page.content_html);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/cms/${editingPage.slug}`, {
        title: pageTitle,
        contentHtml: pageContent,
      });
      setEditingPage(null);
      loadData();
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white">Content Management & Enquiries</h1>
        <p className="text-xs text-gray-400 mt-1">Edit policy documents and review customer contact messages</p>
      </div>

      {/* Pages Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <FileText size={18} className="text-brand-400" />
          <span>Static CMS Policy Pages</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl bg-[#11141d] border border-gray-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] text-brand-400 font-mono font-bold uppercase tracking-wider">
                  /{p.slug}
                </div>
                <h3 className="text-sm font-bold text-white mt-1">{p.title}</h3>
                <div className="text-[11px] text-gray-500 mt-1">
                  Updated: {formatDateTime(p.updatedAt)} by {p.updated_by || 'Admin'}
                </div>
              </div>

              <button
                onClick={() => handleOpenEditPage(p)}
                className="w-full py-2 bg-gray-800 hover:bg-brand-600 text-gray-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <Edit3 size={13} />
                <span>Edit HTML Content</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Messages Inbox */}
      <div className="space-y-4 pt-6 border-t border-gray-800">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <MessageSquare size={18} className="text-cyan-400" />
          <span>Customer Enquiry Inbox ({enquiries.length})</span>
        </h2>

        <div className="bg-[#11141d] rounded-3xl border border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] bg-gray-900/60">
                  <th className="p-4">Sender</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message</th>
                  <th className="p-4">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {enquiries.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No contact enquiries received yet.</td>
                  </tr>
                ) : (
                  enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-850/50 transition">
                      <td className="p-4 font-bold text-white">{e.name}</td>
                      <td className="p-4 text-gray-400">
                        <div>{e.email}</div>
                        <div className="text-[10px] text-gray-500">{e.phone}</div>
                      </td>
                      <td className="p-4 font-bold text-brand-400">{e.subject}</td>
                      <td className="p-4 text-gray-300 max-w-sm">{e.message}</td>
                      <td className="p-4 text-gray-500 text-[11px]">{formatDateTime(e.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Page Modal */}
      {editingPage && (
        <Modal
          isOpen={Boolean(editingPage)}
          onClose={() => setEditingPage(null)}
          title={`Edit Page: /${editingPage.slug}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleSavePage} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-300 mb-1">Page Title</label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                className="w-full h-10 px-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-300 mb-1">HTML Content</label>
              <textarea
                rows={10}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-mono text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition"
            >
              {saving ? 'Saving...' : 'Save Page Content'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
