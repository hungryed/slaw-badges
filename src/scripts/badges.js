class Badges {
  constructor() {
    this.loaded = false;

    // Prepare to observe/listen to mutations in the chatbox and react to them;
    this.commentClassName = CHAT_ONLY ? 'message-line' : 'chat-line__message';
    this.chatObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if(mutation.type === 'childList' && mutation.addedNodes.length === 1){
          //Only want to add badges to actual user messages, not system alerts or w/e;
          if(mutation.addedNodes[0].classList && mutation.addedNodes[0].classList.contains(this.commentClassName)){
            if(!CHAT_ONLY || !mutation.addedNodes[0].classList.contains('admin')){
              this.getUserInfo(mutation.addedNodes[0]);
            }
          }
        }
      });
    });

    this.users = new Users();

    this.chat;
    this.observeChat();
  }

  observeChat(){
    // Listen for children (add/remove) mutations only: {childList: true}
    //  If we are on Slaw's page
    this.chat = CHAT_ONLY
      ? document.querySelectorAll("ul.chat-lines")[0]
      : document.querySelectorAll(".chat-list__lines .simplebar-scroll-content .simplebar-content .tw-full-height")[0]
    ;
    if(!this.loaded && this.chat && window.location.pathname.includes(STREAMER)){
      this.chatObserver.observe(this.chat, {childList: true});
      this.loaded = CHAT_ONLY;
    }
  }

  getUserInfo(comment){
    let selector = CHAT_ONLY ? '.from' : '.chat-author__display-name';
    const username = comment.querySelectorAll(selector)[0].innerText.toLowerCase();
    this.users.load(username, this.addBadges.bind(this, comment));
  }

  addBadges(comment, user){
    const badgeContainer = this.findBadgeContainer(comment);
    const houseBadge = system.extension.getURL('src/assets/' + user.house + '.png')
    this.prependBadge(badgeContainer, houseBadge, user.title)

    //if(!!user.hc){
    //  const cupBadge = system.extension.getURL('src/assets/hc.png')
    //  this.prependBadge(badgeContainer, cupBadge, 'House cup!');
    //}
  }

  findBadgeContainer(comment) {
    if(CHAT_ONLY){
      return comment.querySelectorAll('.badges')[0];
    }

    let spanList = comment.querySelectorAll('span'),
      container = spanList[0];

    if (spanList[0].classList.contains('chat-line__timestamp')) {
        container = spanList[1];
    }

    return container;
  }

  prependBadge(container, badge, title){
    const newBadge =
      '<div class="tw-tooltip-wrapper tw-inline' + (CHAT_ONLY ? ' float-left' : '') + '" data-a-target="chat-badge">'
        + '<img alt="' + title + '" class="chat-badge" src="' + badge + '">'
        + '<div class="tw-tooltip tw-tooltip--up tw-tooltip--align-left" data-a-target="tw-tooltip-label" style="margin-bottom: 0.9rem;">' + title + '</div>'
      + '</div>'
    ;

    container.insertAdjacentHTML('afterbegin', newBadge);
  }
}
