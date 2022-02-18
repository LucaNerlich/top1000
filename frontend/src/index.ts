
type PlatformData = {
    first_release_date: string,
    platform_id: number,
    platform_name: string
}

type ResultItem = {
    id: string,
    text: string,
    date: string,
    image?: string,
    platforms: PlatformData[]
}

// eslint-disable-next-line
declare module Select2 {
    interface DataFormat {
        date: string,
        image?: string,
        platforms: PlatformData[]
    }
}

let current_game: HTMLElement | undefined = undefined;

function getLabel(item: ResultItem) {
    if(item.platforms !== undefined) {
        let temp;
        let date = 99999;
        let platforms = "";
        for(let i = 0; i < item.platforms.length; i++) {
            temp = parseInt(item.platforms[i].first_release_date.substring(0,4));
            if(!Number.isNaN(temp) && temp < date) {
                date = temp;
            }
            if(i > 0) {
                platforms += ", ";
            }
            platforms += item.platforms[i].platform_name;
        }
        return item.text + " (" + date + ") [" + platforms + "]";
    } else {
        return item.text;
    }
}

window.addEventListener("load", () => {
    $("#games select").select2({
        "ajax": {
            "url": "/search",
            "dataType": "json",
            "data": (params) => {
                return {
                    "search": params.term,
                    "page": params.page !== undefined ? params.page : 1
                }
            }
        },
        "templateResult": (data) => {
            const item = data as ResultItem;
            if(typeof item.image === "string" && item.image.length > 0) {
                return $("<div class=\"select_item\"><img src=\"" + item.image + "\"/><span>" + getLabel(item) + "</span></div>")
            } else {
                return getLabel(item);
            }
        },
        "templateSelection": (data) => {
            return getLabel(data as ResultItem);
        }
    });

    const buttons = document.querySelectorAll("#games button");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onClickButton);
    }
});

window.addEventListener("mouseup", (e) => {
    const el = e.target as HTMLElement;
    if(el !== null && el.tagName !== "BUTTON" && el.tagName !== "TEXTAREA") {
        if(el.tagName === "SPAN" && el.classList.contains("select2-selection")) {
            return;
        } else {
            if(current_game !== undefined) {
                setGameSelected(current_game, false);
            }
        }
    }
});
 
function onClickButton(this: HTMLButtonElement) {
    const el_game = findGame(this);
    setGameSelected(el_game, !el_game.classList.contains("game-selected"), true);
}

$(document).on("select2:opening", e => {
    e.stopPropagation();
    setGameSelected(findGame(e.target as HTMLElement), true);
});

$(document).on("select2:close", e => {
    setGameSelected(findGame(e.target as HTMLElement), false);
});

$(document).on('select2:open', () => {
    setTimeout(() => {
        const x = document.querySelector('.select2-search__field') as HTMLElement;
        if(x !== null) {
            x.focus();
        }
    }, 10);    
});

function findGame(e: HTMLElement) {
    while(e.className !== "game" && e.parentElement !== null && e.dataset.index === undefined) {
        e = e.parentElement;
    }
    return e;
}

function setGameSelected(el: HTMLElement, value: boolean, comment?: boolean) {
    const el_div = el.children[1] as HTMLElement;
    const el_btn = el.querySelector("button") as HTMLButtonElement;
    if(value === false) {
        el.classList.remove("game-selected");
        el_div.classList.add("hidden");
        el_btn.classList.add("btn_expand_more");
        el_btn.classList.remove("btn_expand_less");
        if(el === current_game) {
            current_game = undefined;
        }
    } else {
        if(comment === true) {
            el_div.classList.remove("hidden");
            el_btn.classList.remove("btn_expand_more");
            el_btn.classList.add("btn_expand_less");
            const el_textarea = el_div.querySelector("textarea") as HTMLElement;
            el_textarea.focus();
        }
        if(el === current_game) {
            return;
        }
        el.classList.add("game-selected");
        if(current_game !== undefined) {
            current_game.classList.remove("game-selected");
            const el_cur_div = current_game.children[1] as HTMLElement;
            const el_cur_btn = current_game.querySelector("button") as HTMLButtonElement;
            el_cur_div.classList.add("hidden");
            el_cur_btn.classList.add("btn_expand_more");
            el_cur_btn.classList.remove("btn_expand_less");
        }
        current_game = el;
    }
}