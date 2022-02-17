
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
    $("#main select").select2({
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

    const buttons = document.querySelectorAll("#main button");
    for(let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", onClickButton);
    }
});
 
function onClickButton(this: HTMLButtonElement) {
    const el_parent = this.parentElement as HTMLElement;
    const el_papa = el_parent.parentElement as HTMLElement;
    const el_div = el_papa.nextElementSibling as HTMLElement;
    if(el_div.classList.contains("hidden")) {
        el_div.classList.remove("hidden");
        this.classList.remove("btn_expand_more");
        this.classList.add("btn_expand_less");
    } else {
        el_div.classList.add("hidden");
        this.classList.add("btn_expand_more");
        this.classList.remove("btn_expand_less");
    }
}