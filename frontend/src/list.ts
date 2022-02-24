// redaxios.min.d.ts is index.d.ts from axios 0.26.0
import axios from "./lib/redaxios.min.js"

const entry_template = document.createElement("DIV") as HTMLDivElement;
entry_template.innerHTML = `
<div class="game-head">
  <div><span></span></div>
  <div><img src=""></div>
  <div><span></span></div>
  <div><span class="btn_expand_more"></span></div>
</div>
<div class="hidden game-body">
  <div>
    <div><img class="game-screen"></div>
    <div>
      <div class="container">
        <div class="row justify-content-start">
          <div class="col-4">Platformen:</div>
          <div class="col-8 game-platforms"></div>
        </div>
        <div class="row justify-content-start">
          <div class="col-4">Link:</div>
          <div class="col-8"><a href="" class="game-link">Mobygames</a></div>
        </div>
        <div class="row justify-content-start">
          <div class="col-4">Stimmen:</div>
          <div class="col-8 game-votes"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="game-comments"></div>
</div>
`.replace(/[ ]+/g, " ").replace(/\\n/g, "");
entry_template.className = "game";

let current_game: HTMLElement | undefined = undefined;

async function getListData(page = 1) {
    const ret = await axios.get("/api/list?page=" + page + getFilterString());
    if(ret.status === 200) {
        return ret.data;
    } else {
        throw new Error(ret.statusText);
    }
}

async function loadList(page = 1) {
    const el_mask = document.getElementById("mask") as HTMLDivElement;
    el_mask.classList.remove("hidden");
    try {
        const ret = await getListData(page);
        const data = ret.data;
        const games = [];
        for(let i = 0; i < data.length; i++) {
            const el_item = entry_template.cloneNode(true) as HTMLDivElement;
            const el_head = el_item.children[0] as HTMLDivElement;
            const el_head_img = el_head.children[1].children[0] as HTMLImageElement;
            el_head.children[0].children[0].innerHTML = ((page - 1) * ret.limit + (i + 1)).toString() + ".";
            if(data[i].game.sample_cover !== null) {                
                el_head_img.src = data[i].game.sample_cover.thumbnail_image
            } else if(Array.isArray(data[i].game.sample_screenshots) && data[i].game.sample_screenshots.length > 0) {
                el_head_img.src = data[i].game.sample_screenshots[0].thumbnail_image
            }
            el_head.children[2].children[0].innerHTML = data[i].game.title;
            el_head.addEventListener("click", onClickGame);

            const el_body = el_item.children[1] as HTMLElement;
            if(Array.isArray(data[i].game.sample_screenshots) && data[i].game.sample_screenshots.length > 0) {
                const el_screen = el_body.querySelector("img") as HTMLImageElement;
                el_screen.src = data[i].game.sample_screenshots[0].image;
            }
            const el_link = el_body.querySelector("a.game-link") as HTMLLinkElement;
            el_link.href = data[i].game.moby_url;
            let platform_str = "";
            for(let ii = 0; ii < data[i].game.platforms.length && ii < 7; ii++) {
                if(ii > 0) {
                    platform_str += ", ";
                }
                platform_str += data[i].game.platforms[ii].platform_name + " (" + data[i].game.platforms[ii].first_release_date.substring(0,4) + ")";
            }
            if(data[i].game.platforms.length > 6) {
                platform_str += "...";
            }
            const el_platforms = el_body.querySelector(".game-platforms") as HTMLElement;
            el_platforms.innerHTML = platform_str;

            const el_votes = el_body.querySelector(".game-votes") as HTMLElement;
            el_votes.innerHTML = data[i].votes;

            if(Array.isArray(data[i].comments) && data[i].comments.length > 0) {
                const el_comments = el_body.querySelector(".game-comments") as HTMLElement;
                let comments_str = "";
                for(let ii = 0; ii < data[i].comments.length; ii++) {
                    comments_str += "<p>&ndash; " + data[i].comments[ii] + "</p>";
                }
                el_comments.innerHTML = comments_str;
            }
            games.push(el_item);
        }
        const el_games = document.getElementById("games") as HTMLDivElement;
        el_games.replaceChildren(...games);
        const el_nogames = document.getElementById("nogames") as HTMLDivElement;
        if(data.length > 0) {
            el_nogames.classList.add("hidden");
        } else {
            el_nogames.classList.remove("hidden");
        }
        setupPages(ret.pages, page);
        current_game = undefined;
    } catch(exc) {
        console.error(exc);
    } finally {
        el_mask.classList.add("hidden");
    }
}

window.addEventListener("load", async () => {
    loadList();
    const el_btn_filter = document.getElementById("btnFilter") as HTMLButtonElement;
    el_btn_filter.addEventListener("click", onClickButtonFilter);

    const el_select_gender = document.getElementById("genderSelect") as HTMLSelectElement;
    el_select_gender.addEventListener("change", onChangeFilter);

    const el_select_age = document.getElementById("ageSelect") as HTMLSelectElement;
    el_select_age.addEventListener("change", onChangeFilter);
    
    const el_groups = document.getElementById("filter_groups") as HTMLElement;
    const radios = el_groups.getElementsByTagName("INPUT");
    for(let i = 0; i < radios.length; i++) {
        radios[i].addEventListener("change", onChangeFilter);
    }

});

function setupPages(pages: number, current: number) {
    const el_pages = document.getElementById("pages") as HTMLDivElement;
    while(el_pages.children.length > pages && el_pages.lastElementChild !== null) {
        el_pages.removeChild(el_pages.lastElementChild);
    }
    while(el_pages.children.length < pages && el_pages.children.length < 300) {
        const el_btn = document.createElement("BUTTON") as HTMLButtonElement;
        const page = el_pages.children.length + 1;
        const page_str = page.toString();
        el_btn.innerHTML = page_str;
        el_btn.dataset.page = page_str;
        el_btn.addEventListener("click", onClickPage);
        el_pages.appendChild(el_btn);
    }
    for(let i = 0; i < el_pages.children.length; i++) {
        const el_btn = el_pages.children[i] as HTMLButtonElement;
        if(i === current - 1) {
            el_btn.className = "page-current";
            el_btn.disabled = true;
        } else {
            el_btn.className = "";
            el_btn.disabled = false;
        }
    }
}

function findGame(e: HTMLElement) {
    while(e.className !== "game" && e.className !== "game game-selected" && e.parentElement !== null) {
        e = e.parentElement;
    }
    return e;
}

function setGameSelected(el: HTMLElement, value: boolean) {
    const el_div = el.children[1] as HTMLElement;
    const el_btn = el.children[0].children[3].children[0] as HTMLElement;
    if(value === false) {
        el.classList.remove("game-selected");
        el_div.classList.add("hidden");
        el_btn.classList.add("btn_expand_more");
        el_btn.classList.remove("btn_expand_less");
        if(el === current_game) {
            current_game = undefined;
        }
    } else {
        el_div.classList.remove("hidden");
        el_btn.classList.remove("btn_expand_more");
        el_btn.classList.add("btn_expand_less");

        if(el === current_game) {
            return;
        }
        el.classList.add("game-selected");
        if(current_game !== undefined) {
            current_game.classList.remove("game-selected");
            const el_cur_div = current_game.children[1] as HTMLElement;
            const el_cur_btn = current_game.children[0].children[3].children[0] as HTMLButtonElement;
            el_cur_div.classList.add("hidden");
            el_cur_btn.classList.add("btn_expand_more");
            el_cur_btn.classList.remove("btn_expand_less");
        }
        current_game = el;
    }
}

function getFilterString() {
    let str = "";

    const el_select_gender = document.getElementById("genderSelect") as HTMLSelectElement;
    if(el_select_gender.value !== "") {
        str += "&gender=" + el_select_gender.value;
    }

    const el_select_age = document.getElementById("ageSelect") as HTMLSelectElement;
    const age = parseInt(el_select_age.value);
    if(!(Number.isNaN(age) || age < 1 || age > 9)) {
        str += "&age=" + age.toString();
    }
    
    const el_groups = document.getElementById("filter_groups") as HTMLElement;
    const radios = el_groups.getElementsByTagName("INPUT");
    for(let i = 0; i < radios.length; i++) {
        const el_radio = radios[i] as HTMLInputElement;
        if(el_radio.checked && el_radio.value !== "") {
            str += "&group=" + el_radio.value;
            break;
        }
    }
    return str;
}

function onClickGame(this: HTMLElement, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const el_game = findGame(this);
    setGameSelected(el_game, !el_game.classList.contains("game-selected"));
}

function onClickPage(this: HTMLButtonElement) {
    if(typeof this.dataset.page === "string") {
        loadList(parseInt(this.dataset.page));
    }
}

function onClickButtonFilter(this: HTMLButtonElement) {
    const el_filter = document.getElementById("filter") as HTMLDivElement;
    if(el_filter.classList.contains("hidden")) {
        el_filter.classList.remove("hidden");
        this.classList.add("icon-menu-open");
        this.classList.remove("icon-menu");
    } else {
        el_filter.classList.add("hidden");
        this.classList.remove("icon-menu-open");
        this.classList.add("icon-menu");
    }
}

function onChangeFilter() {
    loadList(1);
}