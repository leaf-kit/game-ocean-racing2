// 컷씬: 역사 인물의 실제 초상화와 대사를 한 줄씩 보여 준다.
// 클릭·스페이스로 다음 줄, ESC로 건너뛰기. show()는 끝날 때 resolve되는 Promise를 돌려준다.
import { findFigure, portraitSrc, figName } from './figures.js?v=20261004a';

const $ = (id) => document.getElementById(id);

export class Cutscene {
  constructor() {
    this.el = $('cutscene');
    this.portrait = $('cs-portrait');
    this.who = $('cs-who');
    this.years = $('cs-years');
    this.text = $('cs-text');
    this.act = $('cs-act');
    this.title = $('cs-title');
    this.sub = $('cs-sub');
    this.next = $('cs-next');
    this.lines = [];
    this.i = 0;
    this.active = false;
    this.typeT = 0; this.full = ''; this.shown = 0;
    this._resolve = null;
    this.el.addEventListener('click', () => this.advance());
    $('cs-skip').addEventListener('click', (e) => { e.stopPropagation(); this.finish(); });
  }

  // lines: [{ who, text }], head: { act, title, subtitle }, myName: 플레이어 이름, myPortrait: 인물 id
  show(lines, head, myName, myFigureId) {
    this.lines = (lines || []).filter((l) => l && l.text);
    if (!this.lines.length) return Promise.resolve();
    this.myName = myName || '제독';
    this.myFigure = myFigureId;
    this.i = -1;
    this.active = true;
    this.act.textContent = head?.act || '';
    this.title.textContent = head?.title || '';
    this.sub.textContent = head?.subtitle || '';
    this.el.classList.remove('hidden');
    document.body.classList.add('cs-on'); // 컷씬 동안 언어 선택·플레이리스트·메뉴를 가린다
    requestAnimationFrame(() => this.el.classList.add('on'));
    this.advance();
    return new Promise((res) => { this._resolve = res; });
  }

  advance() {
    if (!this.active) return;
    // 타이핑 중이면 먼저 전체를 드러낸다
    if (this.shown < this.full.length) { this.shown = this.full.length; this.text.textContent = this.full; this.next.classList.remove('hidden'); return; }
    this.i++;
    if (this.i >= this.lines.length) { this.finish(); return; }
    const L = this.lines[this.i];
    const isMe = !L.who || L.who === 'me';
    const f = isMe ? null : findFigure(L.who);
    const pid = isMe ? this.myFigure : L.who;
    if (pid) {
      this.portrait.src = portraitSrc(pid);
      this.portrait.classList.remove('hidden');
      this.portrait.alt = isMe ? this.myName : figName(f);
    } else this.portrait.classList.add('hidden');
    this.who.textContent = isMe ? this.myName : figName(f);
    this.years.textContent = isMe ? '제독' : `${f.nation} · ${f.years}`;
    this.el.classList.toggle('me', isMe);
    this.full = L.text; this.shown = 0; this.typeT = 0;
    this.text.textContent = '';
    this.next.classList.add('hidden');
  }

  // 한 글자씩 드러내기 (main 루프에서 매 프레임 호출)
  update(dt) {
    if (!this.active || this.shown >= this.full.length) return;
    this.typeT += dt;
    const per = 0.022;
    while (this.typeT >= per && this.shown < this.full.length) { this.typeT -= per; this.shown++; }
    this.text.textContent = this.full.slice(0, this.shown);
    if (this.shown >= this.full.length) this.next.classList.remove('hidden');
  }

  finish() {
    if (!this.active) return;
    this.active = false;
    this.el.classList.remove('on');
    document.body.classList.remove('cs-on');
    setTimeout(() => this.el.classList.add('hidden'), 320);
    const r = this._resolve; this._resolve = null;
    if (r) r();
  }
}
