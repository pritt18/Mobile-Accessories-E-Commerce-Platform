import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export const StaticCMSPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/cms/${slug}`);
        if (res.data?.success) {
          setPage(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [slug]);

  if (loading) return <div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Loading page...</div>;
  if (!page) return <div className="max-w-4xl mx-auto py-20 text-center text-slate-500">Page not found</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-black text-slate-900">{page.title}</h1>
      </div>
      <div
        className="prose max-w-none text-sm text-slate-700 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: page.content_html }}
      />
    </div>
  );
};
