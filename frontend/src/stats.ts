// chart.min.d.ts is a slightly modified version of DefinitelyTyped Type definitions for Chart.js 2.9.
// redaxios.min.d.ts is index.d.ts from axios 0.26.0
import "./lib/chart.min.js"
import axios from "./lib/redaxios.min.js"

type BracketOptions = {
    init: {[key: string]: unknown},
    skipConsolationRound: boolean,
    teamWidth: number,
    scoreWidth: number,
    matchMargin: number,
    roundMargin: number
};

interface BoostrapCollapse {
    toggle: () => void;
    hide: () => void;
}

declare global {
    interface JQuery {
        bracket(arg: BracketOptions): JQuery;
        collapse(arg: string): void;
    }
    interface Window {
        feather: {
            replace: ()=>void
        },
        bootstrap: {
            Collapse: new(el: HTMLElement, opt: {[key: string]: unknown}) => BoostrapCollapse;
        }
    }
}

enum Menu {
    LGS_OVERVIEW,
    LGS_SEASONS,
    LGS_BONUS,
    BELT,
    TOP5,
    OTHER
}

enum ChartType {
    BAR,
    PIE
}

type Current = {
    menu: Menu,
    menu_link: MenuLink | undefined,
    submenu: number,
    charttype: ChartType,
    chartid: string
    obj: {
        menu: BoostrapCollapse,
        chart?: Chart
    }
};

type MenuLink = {
    _menu: Menu
} & HTMLLinkElement;

type SubmenuLink = {
    _menu: Menu,
    _id: number | string,
    _index: number
} & HTMLLinkElement;

const submenus: HTMLLIElement[][] = new Array(6);

const element = {
    "menu": document.getElementById("sidebarMenu") as HTMLElement,
    "submenu": document.getElementById("submenu") as HTMLElement,
    "submenu_list": document.getElementById("submenu_list") as HTMLElement,
    "submenu_btn": document.getElementById("submenu_btn") as HTMLButtonElement,
    "submenu_switch": document.getElementById("submenu_switch") as HTMLElement,
    "chart": document.getElementById("chart") as HTMLCanvasElement,
    "bracket": document.getElementById("bracket") as HTMLDivElement
}

const cur: Current = {
    "menu": Menu.LGS_OVERVIEW,
    "menu_link": undefined,
    "charttype": ChartType.BAR,
    "chartid": "",
    "submenu": 0,
    "obj": {
        "menu": new window.bootstrap.Collapse(element.menu, { "toggle": false })
    }
};

async function httpRequest(url: string) {
    const ret = await axios.get(url);
    if(ret.status === 200) {
        return ret.data;
    } else {
        throw new Error(ret.statusText);
    }
}

function createSubmenuItem(label: string, menu: Menu, id: number | string, index: number): HTMLLIElement {
    const el = document.createElement("LI") as HTMLLIElement;
    const el_a = document.createElement("A") as SubmenuLink;
    el_a.className = "dropdown-item";
    el_a.href = "#";
    el_a.innerHTML = label;
    el_a.addEventListener("click", onSubMenu);
    el_a._menu = menu;
    el_a._id = id;
    el_a._index = index;
    el.appendChild(el_a);
    return el;
}

function createSubmenus() {
    // Menu.LGS_OVERVIEW = 0
    submenus[0] = [
        createSubmenuItem("Stimmen/Autoren", Menu.LGS_OVERVIEW, 1, 0),
        createSubmenuItem("Posts/Likes", Menu.LGS_OVERVIEW, 2, 1),
    ];
    // Menu.LGS_SEASONS = 1
    submenus[1] = [];
    for(let i = 1; i <= 9; i++) {
        submenus[1].push(createSubmenuItem("Staffel " + i, Menu.LGS_SEASONS, i, i));
    }
    // Menu.LGS_BONUS = 2
    submenus[2] = [];
    httpRequest("/stats/api?type=list&id=bonus").then(data => {
        for(let i = 1; i < data.length; i++) {
            submenus[2].push(createSubmenuItem(data[i].title, Menu.LGS_BONUS, data[i].id, i));
        }
    }).catch(() => {
        console.error("Failed to fetch bonus episodes");
    });
    // Menu.BELT = 3
    submenus[3] = [];
    httpRequest("/stats/api?type=list&id=belt").then(data => {
        for(let i = 1; i < data.length; i++) {
            submenus[3].push(createSubmenuItem(data[i].title, Menu.BELT, data[i].id, i));
        }
    }).catch(() => {
        console.error("Failed to fetch gürtel episodes");
    });
    // Menu.TOP5 = 4
    submenus[4] = [];
    httpRequest("/stats/api?type=list&id=top5").then(data => {
        for(let i = 1; i < data.length; i++) {
            submenus[4].push(createSubmenuItem(data[i].title, Menu.TOP5, data[i].id, i));
        }
    }).catch(() => {
        console.error("Failed to fetch gürtel episodes");
    });
}

function changeSubmenu(menu: Menu) {
    while(element.submenu_list.lastChild !== null) {
        element.submenu_list.removeChild(element.submenu_list.lastChild);
    }
    const submenu = submenus[menu];
    cur.submenu = 0;
    const first_link = submenu[0].querySelector("A") as SubmenuLink;
    element.submenu_btn.innerHTML = "<div class=\"dropdown-toggle\">" + first_link.innerHTML + "</div>";
    for(let i = 0; i < submenu.length; i++) {
        element.submenu_list.appendChild(submenu[i]);
    }
    return first_link._id;
}

function setSubmenuSwitch(visible: boolean, pie?: boolean) {
    if(visible) {
        if(pie !== undefined) {
            const el_pie = element.submenu_switch.children[0] as HTMLButtonElement;
            const el_bar = element.submenu_switch.children[1] as HTMLButtonElement;
            if(pie) {
                el_pie.classList.add("switch-selected");
                el_bar.classList.remove("switch-selected");
                cur.charttype = ChartType.PIE;
            } else {
                el_pie.classList.remove("switch-selected");
                el_bar.classList.add("switch-selected");
                cur.charttype = ChartType.BAR;
            }
        }
        element.submenu_switch.classList.remove("hidden");
    } else {
        element.submenu_switch.classList.add("hidden");
    }
}

function onMenu(e: Event) {
    e.preventDefault();
    
    const el = e.target as MenuLink;
    if(cur.menu === el._menu) {
        return;
    }
    cur.menu = el._menu;
    if(cur.menu_link !== undefined) {
        cur.menu_link.classList.remove("sidebar-cur");
    }
    cur.menu_link = el;
    el.classList.add("sidebar-cur");

    const first_id = changeSubmenu(el._menu);
    switch(el._menu) {
        case Menu.LGS_OVERVIEW: {
            setSubmenuSwitch(false);
            setupLGSChart(1);
            element.chart.classList.remove("hidden");
            element.bracket.classList.add("hidden");
            break;
        }
        case Menu.LGS_SEASONS: {
            setSubmenuSwitch(false);
            setupLGSStaffel(1);
            element.chart.classList.add("hidden");
            element.bracket.classList.remove("hidden");
            break;
        }
        case Menu.LGS_BONUS: case Menu.TOP5: case Menu.BELT: {
            setSubmenuSwitch(true);
            if(cur.charttype === ChartType.PIE) {
                setupPieChart(first_id as string);
            } else {
                setupBarChart(first_id as string);
            }
            element.chart.classList.remove("hidden");
            element.bracket.classList.add("hidden");
            break;
        }
    }

    cur.obj.menu.hide();
}

function onSubMenu(e: Event) {
    e.preventDefault();
    const el = e.target as SubmenuLink;
    if(el._index === cur.submenu) {
        return;
    }
    cur.submenu = el._index;
    element.submenu_btn.innerHTML = "<div class=\"dropdown-toggle\">" + el.innerHTML + "</div>";
    
    switch(el._menu) {
        case Menu.LGS_OVERVIEW: {
            setupLGSChart(el._id as number);
            break;
        }
        case Menu.LGS_SEASONS: {
            setupLGSStaffel(el._id as number);
            break;
        }
        case Menu.LGS_BONUS: case Menu.BELT: case Menu.TOP5: {
            if(cur.charttype === ChartType.BAR) {
                setupBarChart(el._id as string);
            } else {
                setupPieChart(el._id as string);
            }
            break;
        }        
    }
}

function onChartSwitch(e: Event) {
    e.stopPropagation();
    let el = e.target as HTMLElement;
    while(el.tagName !== "BUTTON") {
        el = el.parentElement as HTMLElement;
    }
    if(el.classList.contains("switch-selected")) {
        return;
    }
    el.classList.add("switch-selected");
    const el_other = (el.previousElementSibling === null) ? el.nextElementSibling as HTMLButtonElement : el.previousElementSibling as HTMLButtonElement;
    el_other.classList.remove("switch-selected");
    if(el.dataset.target === "pie") {
        cur.charttype = ChartType.PIE;
        setupPieChart(cur.chartid);

    } else {
        cur.charttype = ChartType.BAR;
        setupBarChart(cur.chartid);
    }
}

function setupLGSChart(id: number) {
    if(cur.obj.chart !== undefined) {
        cur.obj.chart.destroy();
    }
    httpRequest("stats/api?type=chart&id=lgs" + id).then(ret => {
        cur.obj.chart = new window.Chart(element.chart, {
            "type": "line",
            "data": ret.data,
            "options": {
                "responsive": true,
                "interaction": {
                    "mode": "index",
                    "intersect": false,
                },
                "plugins": {
                    "tooltip": {
                        "callbacks": {
                            "afterTitle": (context: any) => {
                                const i = context[0].dataIndex;
                                return ret.labels[i];
                            }
                        }
                    }
                }
            }
        });
    }).catch(exc => {
        console.error(exc);
    });
}

function setupLGSStaffel(id: number) {
    httpRequest("stats/api?type=bracket&id=" + id).then(ret => {
        const el_title = element.bracket.children[0] as HTMLElement;
        const el_time = element.bracket.children[1] as HTMLElement;
        el_title.innerHTML = ret.label;
        el_time.innerHTML = ret.time;
        $(element.bracket.children[2]).bracket({
            init: ret.data,
            skipConsolationRound: true,
            teamWidth: 160,
            scoreWidth: 37,
            matchMargin: 60,
            roundMargin: 50
        });
    }).catch(exc => {
        console.error(exc);
    });
}

function setupPieChart(id: string) {
    if(cur.obj.chart !== undefined) {
        cur.obj.chart.destroy();
    }
    httpRequest("stats/api?type=pie&id=" + id).then(ret => {
        cur.obj.chart = new window.Chart(element.chart, {
            "type": "pie",
            "data": ret.data,
            "options": {
                "plugins": {
                    "title": {
                        "display": true,
                        "text": ret.title
                    },
                    "subtitle": {
                        "display": true,
                        "text": ret.date
                    }
                }
            }
        });
        cur.chartid = id;
    }).catch(exc => {
        console.error(exc);
    });
}

function setupBarChart(id: string) {
    if(cur.obj.chart !== undefined) {
        cur.obj.chart.destroy();
    }
    httpRequest("stats/api?type=pie&id=" + id).then(ret => {
        cur.obj.chart = new window.Chart(element.chart, {
            "type": "bar",
            "data": ret.data,
            "options": {
                "plugins": {
                    "legend": {
                        "display": false
                    },
                    "title": {
                        "display": true,
                        "text": ret.title
                    },
                    "subtitle": {
                        "display": true,
                        "text": ret.date
                    }
                }
            }
        });
        cur.chartid = id;
    }).catch(exc => {
        console.error(exc);
    });
}

createSubmenus();

window.addEventListener("load", () => {
    window.feather.replace();
    const el_links = element.menu.querySelectorAll(".nav-link");
    for(let i = 0; i < el_links.length; i++) {
        const link = el_links[i] as MenuLink;
        if(i === 0) {
              cur.menu_link = link;
        }
        link.addEventListener("click", onMenu);
        link._menu = i;
    }
    for(let i = 0; i < element.submenu_switch.children.length; i++) {
        element.submenu_switch.children[i].addEventListener("click", onChartSwitch);
    }
    changeSubmenu(Menu.LGS_OVERVIEW);
    setupLGSChart(1);
});