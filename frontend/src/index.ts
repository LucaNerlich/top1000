
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