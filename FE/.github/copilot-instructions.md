# Copilot / AI assistant instructions — NekoNihongo (FE)

Quick, actionable notes to help an AI code assistant be productive working on this frontend.

1. Big picture

- This is a Vite + React (TSX) single-page app located in `nekonihongo/`.
- Navigation is NOT using React Router in practice: `src/App.tsx` implements a simple state-driven router (`currentPage`) and passes an `onNavigate` callback to pages.
- Authentication is provided by `src/context/AuthContext.tsx` and consumed via `useAuth()`.

2. Key files / entry points (read before changing behavior)

- `src/App.tsx` — top-level app; `AppContent` enforces login/splash, `MainApp` holds `currentPage` and `handleNavigate`.
- `src/context/AuthContext.tsx` — login/logout, localStorage keys, and `login()` calls `onNavigate?.("mypage")`.
- `src/pages/MyPage.tsx` — role-check: if `user.role === 'admin'` it calls `onNavigate("/admin/DashboardAdmin")`, otherwise `onNavigate("/user/MyPageUser")`.
- `src/pages/admin/DashboardAdmin.tsx` and `src/pages/user/MyPageUser.tsx` — admin/user landing pages; both accept `onNavigate` prop.

3. Navigation contract and important gotchas

- The canonical navigation mechanism is: components call the `onNavigate(page: string)` callback they receive from the parent. `MainApp` sets `currentPage` to that string.
- `MainApp` currently checks simple keys: `"landing"`, `"vocabulary"`, `"grammar"`, `"kanji"`, `"flashcard"`, `"exercise"`, `"mypage"`.
- Important inconsistency: `MyPage.tsx` uses path-like strings (`"/admin/DashboardAdmin"` and `"/user/MyPageUser"`) when calling `onNavigate`. Those strings will not match any case in `MainApp` unless you add matching conditions. When adding or fixing behavior, either:
  - Standardize MyPage to call `onNavigate('admin')` / `onNavigate('user')`, OR
  - Add cases in `MainApp` to handle the full string values (e.g. `{currentPage === '/admin/DashboardAdmin' && <DashboardAdmin onNavigate={handleNavigate} />}`).

4. Auth & localStorage conventions to note

- `AuthContext.login` stores:
  - `localStorage.setItem('accessToken', data.token)`
  - `localStorage.setItem('refreshToken', data.refreshToken)`
  - `localStorage.setItem('nekoUser', JSON.stringify(data.user))`
- `DashboardAdmin.tsx` currently reads `localStorage.getItem('token')` and `localStorage.getItem('user')` when fetching admin data — this is inconsistent with `AuthContext`. Either:
  - Update `DashboardAdmin` to use `accessToken` and `nekoUser`, or
  - Update `AuthContext` to set `token`/`user` keys. Be explicit and consistent.

5. How to add or wire a new page (concrete)

- Create the component (prefer `src/pages/` or `src/components/`) and accept `onNavigate: (page: string) => void` prop.
- Add import to `src/App.tsx` and a rendering line inside `MainApp`, e.g.:

  import { DashboardAdmin } from './pages/admin/DashboardAdmin'
  ...
  {currentPage === 'admin' && <DashboardAdmin onNavigate={handleNavigate} />}

6. Dev / build commands (run from `nekonihongo/`)

- Install: `npm install`
- Dev server: `npm run dev` (Vite)
- Build: `npm run build`

7. Backend / integration notes

- `DashboardAdmin` fetches `http://localhost:8080/api/admin/users` with `Authorization: Bearer <token>` — the dev backend is expected at port 8080.
- Check localStorage token key consistency before calling backend APIs.

8. Patterns & conventions in this repo

- Small, hand-rolled navigation via `onNavigate` instead of router; many components expect an `onNavigate` prop. Prefer preserving this pattern when making small changes.
- UI uses Tailwind-style utility classes (mostly inlined). Some components contain embedded styles (`<style>{...}</style>` blocks).
- Several admin/user pages use mock/local state (not yet wired to full backend). Tests are not present.

9. When editing for the user-role flow (explicit example)

- If you implement the requested behavior `Login(auth ok) -> MyPage -> redirect admin or user`, the minimal correct approach is:
  - Ensure `AuthContext.login` calls `onNavigate?.('mypage')` (already present).
  - In `MyPage.tsx` check `user.role` and call `onNavigate('admin')` or `onNavigate('user')`.
  - In `src/App.tsx` add cases `{currentPage === 'admin' && <DashboardAdmin onNavigate={handleNavigate} />}` and `{currentPage === 'user' && <MyPageUser onNavigate={handleNavigate} />}`.

10. Where to look next / PR checklist for navigation/auth fixes

- Verify `AuthContext` and `DashboardAdmin` use the same localStorage keys.
- Standardize all `onNavigate(...)` calls to the same token format (prefer simple page ids, not path strings).
- Manually run dev server and test login → mypage → admin/user redirect.

If any of the above assumptions are incorrect or you prefer path-like navigation instead of page ids, tell me which naming you want standardized (page ids like `admin`/`user` or path strings like `/admin/DashboardAdmin`) and I will update `MyPage.tsx` and `src/App.tsx` accordingly.

Key references:

- `src/App.tsx`, `src/context/AuthContext.tsx`, `src/pages/MyPage.tsx`, `src/pages/admin/DashboardAdmin.tsx`, `src/pages/user/MyPageUser.tsx`
