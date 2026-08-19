/**
 * EduPulse - Shared sidebar/topbar. Keeps navigation consistent & easy to upgrade
 * (add one entry here and it appears on every page).
 */
const EduLayout = (() => {
  const NAV = [
    { id: 'dashboard', href: 'index.html', icon: 'fa-shapes', label: 'Bảng Điều Khiển', color: 'text-brand-500' },
    { id: 'accounts', href: 'admin.html', icon: 'fa-users-gear', label: 'Quản Lý Tài Khoản', color: 'text-rose-500', adminOnly: true },
    { id: 'academic', href: 'academic.html', icon: 'fa-school', label: 'Trường & Lớp Học', color: 'text-cyan-400', staffOnly: true },
    { id: 'attendance', href: 'attendance.html', icon: 'fa-clipboard-check', label: 'Điểm Danh', color: 'text-amber-400' },
    { id: 'ide', href: 'ide.html', icon: 'fa-code', label: 'AI IDE & Lập Trình', color: 'text-emerald-400' },
    { id: 'english', href: 'english.html', icon: 'fa-language', label: 'Học Tiếng Anh', color: 'text-sky-400' },
    { id: 'social', href: 'social.html', icon: 'fa-comments', label: 'Mạng Xã Hội', color: 'text-pink-400' },
    { id: 'projects', href: 'projects.html', icon: 'fa-globe', label: 'Dự Án & Website', color: 'text-indigo-400' },
    { id: 'store', href: 'store.html', icon: 'fa-store', label: 'Cửa Hàng Tiện Ích', color: 'text-fuchsia-400' },
    { id: 'settings', href: 'settings.html', icon: 'fa-gear', label: 'Cài Đặt Tài Khoản', color: 'text-slate-400' }
  ];

  function initials(name) {
    return (name || '?').trim().split(/\s+/).slice(-2).map(s => s[0]).join('').toUpperCase();
  }

  function render(activeId) {
    const user = EduAPI.getUser();
    if (!user) return;
    const items = NAV.filter(n => {
      if (n.adminOnly && user.role !== 'admin') return false;
      if (n.staffOnly && !['admin', 'teacher'].includes(user.role)) return false;
      return true;
    }).map(n => `
      <a href="${n.href}" class="tab-link ${activeId === n.id ? 'active-tab-style' : ''} w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-indigo-400 hover:text-white hover:bg-white/5 transition-all text-sm font-bold">
        <i class="fa-solid ${n.icon} text-lg w-6 ${n.color}"></i> ${n.label}
      </a>`).join('');

    const sidebarSlot = document.getElementById('sidebar-slot');
    if (sidebarSlot) {
      sidebarSlot.outerHTML = `
      <aside class="w-80 glass-panel border-r border-white/5 flex flex-col justify-between hidden lg:flex m-4 rounded-3xl overflow-hidden shadow-2xl transition-all" id="main-sidebar">
        <div>
          <div class="p-6 border-b border-white/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-earth-americas text-cyan-400 text-3xl drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"></i>
              <div class="flex flex-col">
                <span class="text-sm font-black text-slate-100 tracking-tight uppercase">EDUPULSE</span>
                <span class="text-[9px] text-cyan-400 font-bold tracking-widest uppercase block mt-0.5">${user.role}</span>
              </div>
            </div>
          </div>
          <nav class="p-4 space-y-1 overflow-y-auto max-h-[70vh]">${items}</nav>
        </div>
        <div class="p-6 border-t border-white/5 space-y-4">
          <div class="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
            <div class="avatar-initial w-9 h-9 text-xs overflow-hidden">${user.avatar ? `<img src="${EduAPI.fileUrl(user.avatar)}" class="w-full h-full object-cover">` : initials(user.fullName || user.username)}</div>
            <span class="truncate flex-1 text-xs font-bold text-slate-300">${user.fullName || user.username}</span>
            <button onclick="EduLayout.logout()" class="text-rose-400 hover:text-rose-300" title="Đăng xuất"><i class="fa-solid fa-power-off"></i></button>
          </div>
        </div>
      </aside>`;
    }

    const mobileSlot = document.getElementById('mobile-nav-slot');
    if (mobileSlot) {
      mobileSlot.innerHTML = `<div class="p-4 space-y-1">${items}</div>`;
    }
  }

  function logout() {
    EduAPI.clearToken();
    window.location.href = 'index.html';
  }

  function guard(activeId, opts = {}) {
    if (!EduAPI.requireLogin()) return false;
    const user = EduAPI.getUser();
    if (opts.adminOnly && user.role !== 'admin') {
      EduAPI.toast('Yêu cầu quyền Admin.', 'error');
      window.location.href = 'index.html';
      return false;
    }
    if (opts.staffOnly && !['admin', 'teacher'].includes(user.role)) {
      EduAPI.toast('Yêu cầu quyền Giáo viên/Admin.', 'error');
      window.location.href = 'index.html';
      return false;
    }
    render(activeId);
    return true;
  }

  return { render, guard, logout, NAV };
})();
