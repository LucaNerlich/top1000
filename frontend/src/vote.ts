
/**
 * Mobygames platform information for game
 */
type PlatformData = {
    first_release_date: string,
    platform_id: number,
    platform_name: string
}

/**
 * Suggested game returned by server for selects
 */
type ResultItem = {
    id: string,
    text: string,
    date: string,
    image?: string,
    platforms: PlatformData[]
}

/**
 * Search result for select2 suggestions
 */
type SearchResult = {
    results: ResultItem[],
    pagination: {
        more: boolean
    }
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
const games_ids = new Array<string>(31);

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Setup JquerySelect2 select dropdown
 */
function setupSelect2() {
    // Create select2s
    $(".game select").select2({
        "ajax": {
            "url": "/search",
            "dataType": "json",
            "data": (params) => {
                // returns GET params send to server
                return {
                    "search": params.term,
                    "page": params.page !== undefined ? params.page : 1
                }
            },
            "processResults": (data: SearchResult) => {
                // only show suggestions for games not yet selected
                data.results = data.results.filter(el => {
                    return !games_ids.includes(el.id);
                })
                return data;
            }
        },
        "templateResult": (data) => {
            // show image for suggestion item if present
            const item = data as ResultItem;
            if(typeof item.image === "string" && item.image.length > 0) {
                return $("<div class=\"select_item\"><img src=\"" + item.image + "\"/><span>" + getLabel(item) + "</span></div>");
            } else {
                return getLabel(item);
            }
        },
        "templateSelection": (data) => {
            // return label of selected game
            return getLabel(data as ResultItem);
        }
    });

    // events
    const doc = $(document);
    doc.on("select2:opening", onSelect2Opening);
    doc.on("select2:open", onSelect2Open);
    doc.on("select2:close", onSelect2Close);
    doc.on("select2:select", onSelect2Select);
}

/**
 * Setup page eventhandlers etc
 */
function setup() {
    // create select2s
    setupSelect2();

    // eventhandler for next slide buttons
    let buttons = document.querySelectorAll("button[value='next']");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onClickButtonNext);
    }

    // eventhandler for previous slide buttons
    buttons = document.querySelectorAll("button[value='back']");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onClickButtonBack);
    }

    // eventhandler for game expand/collapse buttons
    buttons = document.querySelectorAll(".game button");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onClickButtonGame);
    }

    // eventhandler for submit button
    const el_submit = document.getElementById("btnSubmit") as HTMLButtonElement;
    el_submit.addEventListener("click", validate);

    // Overall mouseup
    window.addEventListener("mouseup", onWindowMouseUp);
}

window.addEventListener("load", setup);

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Window mouseup eventhandler
 * @param e MouseEvent
 * @returns 
 */
function onWindowMouseUp(e: MouseEvent) {
    // Deselect current game when clicking somewhere...
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
}

/**
 * Click event handler for expand/collapse button of games
 * @param e Event
 */
function onClickButtonGame(e: Event) {
    if(e.target instanceof HTMLElement) {
        const el_game = findGame(e.target);
        setGameSelected(el_game, !el_game.classList.contains("game-selected"), true);
    }
}

/**
 * Click event handler for buttons to switch to next slide/page
 * @param e Event
 */
function onClickButtonNext(e: Event) {
    const el = e.target;
    if(el instanceof HTMLElement) {
        const el_div = el.parentElement as HTMLElement;
        const el_slide = el_div.parentElement as HTMLElement;
        const el_next = el_slide.nextElementSibling as HTMLElement;
        el_next.classList.remove("hidden");
        el_slide.classList.add("hidden");
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    }
}

/**
 * Click event handler for buttons to switch to previous slide/page
 * @param this 
 */
function onClickButtonBack(e: Event) {
    const el = e.target;
    if(el instanceof HTMLElement) {
        const el_div = el.parentElement as HTMLElement;
        const el_slide = el_div.parentElement as HTMLElement;
        const el_prev = el_slide.previousElementSibling as HTMLElement;
        el_prev.classList.remove("hidden");
        el_slide.classList.add("hidden");    
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    }
}

/**
 * Called before a select2 dropdown is opened
 * @param e 
 */
function onSelect2Opening(e: Event) {
    if(e.target instanceof HTMLElement) {
        e.stopPropagation();
        // Select corresponding game
        setGameSelected(findGame(e.target), true);
    }
}

/**
 * Called when a select2 dropdown was opened
 */
function onSelect2Open() {
    setTimeout(() => {
        // focus current select2 input field
        const x = document.querySelector('.select2-search__field') as HTMLElement;
        if(x !== null) {
            x.focus();
        }
    }, 10);  
}

/**
 * Called when a select2 dropdown was closed
 * @param e Event
 */
function onSelect2Close(e: Event) {
    if(e.target instanceof HTMLElement) {
        // Select game
        setGameSelected(findGame(e.target), false);
    }
}

/**
 * Called when a game was selected by a select2 dropdown
 * @param e Event
 */
function onSelect2Select(e: Event) {
    const el_select = e.target as HTMLSelectElement;
    const el_game = findGame(el_select);
    const game_index = parseInt(el_game.dataset.index as string);

    // save id of selected game
    games_ids[game_index] = el_select.value;
    
    let el_span = el_select.nextElementSibling as HTMLElement;
    el_span = el_span.children[0].children[0] as HTMLElement;

    // check if game of highlighted before by validation
    if(el_span.classList.contains("select-highlight")) {
        el_span.classList.remove("select-highlight");

        // check if there are still games missing on this slide/page
        const games_start = Math.floor((game_index - 1) / 10) * 10 + 1;
        const games_end = games_start + 10;
        let i = 0;
        for(i = games_start; i < games_end; i++) {
            if(games_ids[i] === undefined) {
                break;
            }
        }
        if(i === games_end) {
            // if not: hide error message
            const slide_i = Math.floor((game_index - 1) / 10) + 2;
            const el_error = document.getElementById("slide" + slide_i + "_error") as HTMLElement;
            el_error.classList.add("hidden");
        }
    }
}

/* ------------------------------------------------------------------------------------------------------------------------------------------ */

/**
 * Find game container element by child element
 * @param e Child element of game
 * @returns Game html element
 */
function findGame(e: HTMLElement) {
    while(e.className !== "game" && e.className !== "game game-selected" && e.parentElement !== null && e.dataset.index === undefined) {
        e = e.parentElement;
    }
    return e;
}

/**
 * Returns label string for suggestion item
 * @param item Suggestion item
 * @returns label string
 */
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
            if(i < 6) {
                if(i > 0) {
                    platforms += ", ";
                }
                platforms += item.platforms[i].platform_name;
            }
        }
        if(item.platforms.length > 6) {
            platforms += "...";
        }

        return item.text + " (" + date + ") [" + platforms + "]";
    } else {
        return item.text;
    }
}

/**
 * (De)Select a game
 * @param el game container element
 * @param value selected?
 * @param comment Expand comment area?
 * @returns 
 */
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

/**
 * Validate form and submit if possible
 */
function validate() {
    let slide_first = 10;
    let missing_games = 0;
    for(let slide_i = 2; slide_i <= 4; slide_i++) {
        const game_start = (slide_i - 2) * 10 + 1;
        const game_end = game_start + 10;
        let slide_missing = 0;
        for(let game_i = game_start; game_i < game_end; game_i++) {
            const el_game = document.getElementById("game" + game_i) as HTMLSelectElement;
            if(el_game.value === "") {
                slide_missing++;            
                let el_game_span = el_game.nextElementSibling as HTMLElement;
                el_game_span = el_game_span.children[0].children[0] as HTMLElement;
                el_game_span.classList.add("select-highlight");
                if(slide_i < slide_first) {
                    slide_first = slide_i;
                }
                if(slide_missing === 1) {
                    const el_error = document.getElementById("slide" + slide_i + "_error") as HTMLElement;
                    el_error.classList.remove("hidden");
                }
            }
        }
        missing_games += slide_missing;
    }

    if(missing_games === 0) {
        const el_form = document.getElementById("form") as HTMLFormElement;
        el_form.submit();
    } else {
        if(slide_first < 4) {
            const el_slide_cur = document.getElementById("slide4") as HTMLElement;
            const el_slide = document.getElementById("slide" + slide_first) as HTMLElement;
            el_slide_cur.classList.add("hidden");
            el_slide.classList.remove("hidden");
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 10);
        }
    }
}