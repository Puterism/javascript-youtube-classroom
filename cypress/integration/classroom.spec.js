import { ALERT_MESSAGE, SELECTORS } from '../../src/js/constants.js';

describe('나만의 유튜브 강의실 Test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5500/');
  });

  it('동영상 검색 버튼을 눌렀을 때, 유튜브 검색 modal이 나타난다.', () => {
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.CLASS.MODAL).should('be.visible');
  });

  it('modal이 나타난 상태에서, dimmer나 닫기 버튼을 누르면, modal이 사라진다.', () => {
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.CLASS.MODAL_CLOSE).click();
    cy.get(SELECTORS.CLASS.MODAL).should('be.not.visible');

    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.CLASS.MODAL).click('topLeft');
    cy.get(SELECTORS.CLASS.MODAL).should('be.not.visible');
  });

  it('유튜브 검색 modal에서 검색어를 입력하고 검색 버튼을 누르면, 검색 결과를 10개까지 보여준다.', () => {
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_KEYWORD_INPUT).type('무야호');
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_FORM).submit();
    cy.wait(3000);
    cy.get(SELECTORS.CLASS.YOUTUBE_SEARCH_RESULT_LIST).children().should('have.length', 10);
  });

  it('검색어가 비어있는 상태에서 검색 버튼을 누르면, 스낵바 경고 메시지가 나타난다.', () => {
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_FORM).submit();
    cy.get(SELECTORS.ID.SNACKBAR)
      .should('have.css', 'visibility', 'visible')
      .should('have.text', ALERT_MESSAGE.EMPTY_SEARCH_KEYWORD);
  });

  it('유튜브 검색 modal에서 검색 결과 스크롤 바를 끝까지 이동시켰을 경우, 그 다음 10개의 검색 결과를 추가로 보여준다.', () => {
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_KEYWORD_INPUT).type('무야호');
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_FORM).submit();

    cy.wait(3000);

    cy.get(SELECTORS.CLASS.YOUTUBE_SEARCH_RESULT_LIST)
      .children()
      .should('have.length', 10)
      .then(() => {
        cy.get(SELECTORS.CLASS.YOUTUBE_SEARCH_RESULT).scrollTo('bottom');
        cy.wait(3000);
        cy.get(`${SELECTORS.CLASS.YOUTUBE_SEARCH_RESULT_LIST} .clip`).should('have.length', 20);
      });
  });

  it('검색한 검색어는 최근 검색어에 추가된다.', () => {
    const keyword = '무야호';
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_KEYWORD_INPUT).type(keyword);
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_FORM).submit();
    cy.get('.chip').first().should('have.text', keyword);
  });

  it('각 검색 결과 동영상의 저장 버튼을 누르면 볼 영상 목록의 마지막에 저장한 동영상이 추가된다.', () => {
    const keyword = '무야호';
    cy.get(SELECTORS.ID.SEARCH_BUTTON).click();
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_KEYWORD_INPUT).type(keyword);
    cy.get(SELECTORS.ID.YOUTUBE_SEARCH_FORM).submit();
    cy.get(`${SELECTORS.CLASS.MODAL} ${SELECTORS.CLASS.BTN_SAVE}`).first().click();

    cy.get(`${SELECTORS.CLASS.MODAL} ${SELECTORS.CLASS.VIDEO_TITLE}`)
      .first()
      .then(($title) => {
        const title = $title.text();
        cy.get(`main ${SELECTORS.CLASS.VIDEO_TITLE}`).last().should('have.text', title);
      });
  });

  // TODO: 동영상 추가 기능 구현 후 동영상 100개 저장하는 로직 추가하기
  it('저장된 동영상이 100개 이상일 경우, 스낵바 경고 메시지가 나타난다.', () => {
    cy.get(`main ${SELECTORS.CLASS.WATCH_LIST}`).children().should('have.length', 100);
    cy.get(SELECTORS.ID.SNACKBAR)
      .should('be.visible')
      .should('have.text', '동영상은 최대 100개까지 저장할 수 있습니다.');
  });

  it('이전에 저장해뒀던 비디오가 없으면, 저장한 동영상이 없다는 것을 알려주는 이미지를 출력한다.', () => {
    cy.get(SELECTORS.CLASS.WATCH_LIST).then(($watchList) => {
      if ($watchList.find(SELECTORS.CLASS.CLIP).length <= 0) {
        cy.get(SELECTORS.CLASS.NO_VIDEO).should('be.visible');
      }
    });
  });

  it.only('🗑️ 버튼으로 저장된 리스트에서 삭제할 수 있다. (삭제 시 사용자에게 정말 삭제할 것인지 물어봅니다.)', () => {
    cy.get(SELECTORS.CLASS.WATCH_LIST).invoke(
      'append',
      `
        <article class="clip d-flex flex-col" data-video-id="UidhQTm1ulw">
          <div class="preview-container">
            <iframe width="100%" height="118" src="https://www.youtube.com/embed/UidhQTm1ulw" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="">
            </iframe>
          </div>
          <div class="content-container pt-2 px-1 d-flex flex-col justify-between flex-1">
            <div>
              <h3 class="video-title">폴킴 - 안녕 (호텔 델루나 OST PART.10) / 가사</h3>
              <a href="https://www.youtube.com/channel/UCaZhnsQ36GIYYQ1sbxKeMDg" target="_blank" class="channel-name mt-1">
                Music is my life
              </a>
              <div class="meta">
                <p>2019년 8월 25일</p>
              </div>
              
              
                  <div class="menu-list" data-video-id="UidhQTm1ulw" }="">
                    <span class="opacity-hover watched">✅</span>
                    <span class="opacity-hover like">👍</span>
                    <span class="opacity-hover comment">💬</span>
                    <span class="opacity-hover delete">🗑️</span>
                  </div>
                
            </div>
          </div>
        </article>
      `
    );

    cy.get(SELECTORS.CLASS.CLIP).then(($$clips) => {
      const $firstClip = $$clips[0];

      cy.wrap($firstClip).find(SELECTORS.CLASS.DELETE).click();
      cy.on('window:confirm', (str) => {
        expect(str).to.equal(ALERT_MESSAGE.CONFIRM_DELETE);
      });
      cy.on('window:confirm', () => true);
      cy.wrap($firstClip).should('not.exist');
    });
  });
});
