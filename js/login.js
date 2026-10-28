/* Login antarmuka (statis). Hanya membatasi menu; BUKAN keamanan server. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const gate=$('loginGate'),form=$('loginForm'),error=$('loginError');
const pageButtons=[...document.querySelectorAll('#nav [data-page]')];
const SESSION_KEY='sekolah_demo_session_v2',PASSWORD_KEY='sekolah_demo_passwords_v1';
const defaults={admin:'relme1233',murid:'muridspensix',guru:'guruspensix',tendik:'tendikspensix'};
const accounts=[
 {username:'admin',name:'Administrator',role:'Administrator',allowedPages:['home','murid','pengingat','pemeriksa','portal-murid','cek-nisn','walikelas','tenaga','kepegawaian','alumni','pip','foto','cetak-murid','cetak-guru','pengaturan','update']},
 {username:'murid',name:'Murid',role:'Murid',allowedPages:['portal-murid','cek-nisn']},
 {username:'guru',name:'Guru',role:'Guru',allowedPages:['walikelas','foto','portal-murid','cek-nisn','update']},
 {username:'tendik',name:'Tenaga Kependidikan',role:'Tenaga Kependidikan',allowedPages:['tenaga','portal-murid','cek-nisn','update']}
];
let current=null,passwords={...defaults};
try{const saved=JSON.parse(localStorage.getItem(PASSWORD_KEY)||'{}');for(const a of accounts)if(typeof saved[a.username]==='string'&&saved[a.username].length>=6)passwords[a.username]=saved[a.username]}catch(_){}

// Dipakai app.js: navigate() memeriksa hak akses halaman.
window.Auth={can:page=>!!current&&current.allowedPages.includes(page),home:()=>current?.allowedPages[0]||'portal-murid'};

const setText=(id,text)=>{const el=$(id);if(el)el.textContent=text};
function applyRole(account){
 current=account;
 try{sessionStorage.setItem(SESSION_KEY,account.username)}catch(_){}
 const allowed=new Set(account.allowedPages);
 pageButtons.forEach(b=>b.hidden=!allowed.has(b.dataset.page));
 document.querySelectorAll('[data-goto]').forEach(b=>b.hidden=!allowed.has(b.dataset.goto));
 setText('headerName',account.name);setText('menuProfileName',account.name);setText('menuProfileRole',account.role);
 setText('headerAvatar',account.name[0].toUpperCase());setText('welcomeTitle',`Selamat datang, ${account.name}`);
 gate.hidden=true;document.body.classList.remove('login-locked');
 window.navigate?.(account.allowedPages[0]);
}
function logout(){
 current=null;try{sessionStorage.removeItem(SESSION_KEY)}catch(_){}
 $('profileMenu').hidden=true;gate.hidden=false;document.body.classList.add('login-locked');
 form.reset();error.hidden=true;pageButtons.forEach(b=>b.hidden=true);$('loginUsername').focus();
}
form.addEventListener('submit',e=>{
 e.preventDefault();
 const user=$('loginUsername').value.trim().toLowerCase(),pass=$('loginPassword').value;
 const account=accounts.find(a=>a.username===user&&passwords[a.username]===pass);
 if(!account){error.hidden=false;return}
 error.hidden=true;applyRole(account);
});
$('logoutBtn').addEventListener('click',logout);

$('changePasswordBtn').addEventListener('click',()=>{
 if(!current)return;$('profileMenu').hidden=true;
 const f=(id,label)=>`<div class="form-field"><label for="${id}">${label}</label><input class="field-input" id="${id}" type="password" autocomplete="off" required></div>`;
 App.showModal(`<div class="modal-head"><div><h2>Ganti password</h2><p>Akun ${current.name}. Password tersimpan di browser ini.</p></div><button class="close-modal" data-close aria-label="Tutup">×</button></div><form id="pwChangeForm"><div class="modal-body stack">${f('pwOld','Password saat ini')}${f('pwNew','Password baru (minimal 6 karakter)')}${f('pwNew2','Ulangi password baru')}<p id="pwChangeError" class="login-error" role="alert" hidden></p></div><div class="modal-foot"><button type="button" class="btn btn-secondary" data-close>Batal</button><button class="btn btn-primary">Simpan</button></div></form>`,true);
 $('pwOld').focus();
 $('pwChangeForm').onsubmit=e=>{
  e.preventDefault();
  const fail=m=>{const el=$('pwChangeError');el.textContent=m;el.hidden=false};
  const old=$('pwOld').value,next=$('pwNew').value;
  if(old!==passwords[current.username])return fail('Password saat ini tidak sesuai.');
  if(next.length<6)return fail('Password baru minimal 6 karakter.');
  if(next!==$('pwNew2').value)return fail('Konfirmasi password tidak sama.');
  passwords[current.username]=next;
  try{localStorage.setItem(PASSWORD_KEY,JSON.stringify(passwords))}catch(_){passwords[current.username]=old;return fail('Gagal menyimpan: penyimpanan browser tidak tersedia.')}
  App.closeModal();App.toast('Password diganti','Gunakan password baru saat login berikutnya.');
 };
});

pageButtons.forEach(b=>b.hidden=true);
gate.hidden=false;document.body.classList.add('login-locked');
try{const restored=accounts.find(a=>a.username===sessionStorage.getItem(SESSION_KEY));if(restored)applyRole(restored)}catch(_){}
})();
