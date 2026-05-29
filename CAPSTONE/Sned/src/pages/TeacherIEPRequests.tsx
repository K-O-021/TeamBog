import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

// ── Maroon + Gold + Cream palette (Copied from TeacherHome for self-containment) ──────────────────────────────────────────
const M = {
  maroon:     "#7B1C2A",
  maroonDark: "#5A1220",
  maroonDeep: "#3D0C18",
  maroonLight:"#F7ECEE",
  maroonMid:  "#9B2335",
  maroonPale: "#FDF5F6",
  gold:       "#C49A3C",
  goldLight:  "#FAF3E0",
  cream:      "#FBF7F2",
  white:      "#FFFFFF",
  g50:        "#FAF8F8",
  g100:       "#F0EAEA",
  g200:       "#D9CECE",
  g400:       "#A89090",
  g500:       "#7A6060",
  g600:       "#5A4040",
  g700:       "#3A2828",
  g800:       "#1E1010",
  red:        "#C0392B", redLight: "#FDECEA",
  amber:      "#B8860B", amberLight: "#FEF9E7",
  sky:        "#1A6B8A", skyLight:   "#E8F4F8",
  purple:     "#6C3483", purpleLight:"#F4ECF7",
};

const TNR = `'Times New Roman', Times, serif`;

// ── Icon set (modern SVG) (Copied from TeacherHome for self-containment) ──────────────────────────────────────────────────
type IconName = 'home' | 'users' | 'bell' | 'plus' | 'search' | 'check' | 'alert' | 'chart' | 'brain' | 'shield' | 'file' | 'logout' | 'arrow' | 'clock' | 'star' | 'target' | 'eye' | 'send' | 'activity' | 'download' | 'x' | 'menu' | 'info' | 'grid' | 'save' | 'zap' | 'filter';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const Icon: React.FC<IconProps> = ({ name, size = 16, color = "currentColor", style = {} }) => {
  const icons: Record<IconName, React.ReactNode> = {
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/><path d="M19 8a3 3 0 110 6"/><path d="M22 21v-2a3 3 0 00-2-2.83"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2a4 4 0 00-4 4.5 4 4 0 000 7A4 4 0 009.5 22h5a4 4 0 004-4.5 4 4 0 000-7A4 4 0 0014.5 2h-5z"/><path d="M12 6v12M8 9l4-3 4 3M8 15l4 3 4-3"/></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    save: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  };
  return <span style={style}>{icons[name] || null}</span>;
};

const paginationBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 6,
  border: `1px solid ${M.g200}`,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s",
  background: M.white
};

const inputStyle: React.CSSProperties = { width: "100%", padding: "9px 12px", border: `1px solid ${M.g200}`, borderRadius: 7, fontSize: 13, fontFamily: TNR, outline: "none", boxSizing: "border-box", color: M.g800, background: M.white };

const TeacherIEPRequests: React.FC = () => {
  const { user, iepRequests = [], updateIEPRequest } = useApp();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const ITEMS_PER_PAGE = 5;

  const filteredRequests = useMemo(() => {
    let requests = iepRequests;

    if (filterStatus !== 'all') {
      requests = requests.filter(req => req.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      requests = requests.filter(req =>
        req.studentName.toLowerCase().includes(lowerCaseSearchTerm) ||
        req.parentName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return [...requests].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : parseInt(a.id.split('-')[0]) || 0;
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : parseInt(b.id.split('-')[0]) || 0;
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [iepRequests, filterStatus, searchTerm, sortOrder]);

  const { paginatedRequests, totalPages } = useMemo(() => {
    const total = filteredRequests.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return {
      paginatedRequests: filteredRequests.slice(start, end),
      totalPages: pages || 1
    };
  }, [filteredRequests, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchTerm]);

  const handleApprove = (id: string) => {
    updateIEPRequest(id, 'approved');
    // Optionally add a toast notification here
  };

  const handleReject = (id: string) => {
    updateIEPRequest(id, 'rejected');
    // Optionally add a toast notification here
  };

  return (
    <div style={{ padding: "24px", maxWidth: 900, margin: "0 auto", fontFamily: TNR }}>
      <button
        onClick={() => navigate('/teacher')}
        style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: 20, color: M.g500 }}
      >
        <Icon name="arrow" size={16} color={M.g500} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: M.maroonDeep, marginBottom: 10 }}>IEP Access Requests</h1>
      <p style={{ fontSize: 14, color: M.g500, marginBottom: 20 }}>Manage all Individualized Education Program access requests from parents.</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name="search" size={14} color={M.g400} /></div>
          <input
            type="text"
            placeholder="Search by student or parent name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 32 }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={inputStyle}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div style={{ background: M.white, border: `1px solid ${M.g200}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(123,28,42,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: M.maroonPale, borderBottom: `1px solid ${M.g200}` }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Student Name</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Parent Name</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Subject</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Teacher ID</th>
              <th 
                style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep, cursor: "pointer" }}
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  Modified Date
                  <Icon name="filter" size={12} color={M.maroon} style={{ opacity: sortOrder === 'desc' ? 1 : 0.5 }} />
                </div>
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, fontWeight: 700, color: M.maroonDeep }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: `1px solid ${M.g100}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: M.g800 }}>{req.studentName}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: M.g800 }}>{req.parentName}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: M.g800 }}>{user?.subject || 'N/A'}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: M.g800 }}>{user?.teacherId || 'N/A'}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: M.g500 }}>
                    {req.timestamp 
                      ? new Date(req.timestamp).toLocaleDateString() 
                      : new Date(parseInt(req.id.split('-')[0])).toLocaleDateString()
                    }
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: M.g800 }}>
                    <span style={{
                        padding: "4px 8px",
                        borderRadius: 5,
                        fontSize: 11,
                        fontWeight: 600,
                        color: req.status === 'approved' ? M.maroon : req.status === 'rejected' ? M.red : M.amber,
                        background: req.status === 'approved' ? M.maroonLight : req.status === 'rejected' ? M.redLight : M.amberLight,
                    }}>
                        {req.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    {req.status === 'pending' ? (
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleApprove(req.id)}
                          style={{ background: M.maroon, color: M.white, border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          style={{ background: M.g400, color: M.white, border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontWeight: 700 }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: M.g500 }}>No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ padding: "20px 16px", textAlign: "center", color: M.g400, fontStyle: "italic" }}>No requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ ...paginationBtnStyle, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
          >
            <Icon name="arrow" size={14} color={M.g500} style={{ transform: 'rotate(180deg)' }} />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                ...paginationBtnStyle,
                background: currentPage === i + 1 ? M.maroon : M.white,
                color: currentPage === i + 1 ? M.white : M.g800,
                borderColor: currentPage === i + 1 ? M.maroon : M.g200,
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ ...paginationBtnStyle, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
          >
            <Icon name="arrow" size={14} color={M.g500} />
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherIEPRequests;