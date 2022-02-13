const staffeln = [
    {
        "nr": 1,
        "name": "Beste Story",
        "topics": [
            { "stage": "Finale", "id": 137, "wasted": false, "option1": "BioShock", "option2": "Planescape: Torment" },
            { "stage": "Halbfinale", "id": 124, "wasted": false, "option1": "Persona 5", "option2": "Planescape: Torment" },
            { "stage": "Halbfinale", "id": 103, "wasted": false, "option1": "BioShock", "option2": "The Last of Us" },
            { "stage": "Viertelfinale", "id": 90, "wasted": false, "option1": "Planescape: Torment", "option2": "Grim Fandango" },
            { "stage": "Viertelfinale", "id": 61, "wasted": false, "option1": "GTA IV", "option2": "The Last of Us" },
            { "stage": "Viertelfinale", "id": 51, "wasted": false, "option1": "The Walking Dead", "option2": "Persona 5" },
            { "stage": "Viertelfinale", "id": 19, "wasted": false, "option1": "BioShock", "option2": "Knights of the Old Republic" },
            { "stage": "Welches Spiel haben wir vergessen?", "id": 25, "wasted": false }
        ]
    },
    {
        "nr": 2,
        "name": "Bester zweiter Teil",
        "topics": [
            { "stage": "Finale", "id": 268, "wasted": false, "option1": "Day of the Tentacle", "option2": "Gothic 2" },
            { "stage": "Halbfinale", "id": 265, "wasted": false, "option1": "Anstoss 2", "option2": "Day of the Tentacle" },
            { "stage": "Halbfinale", "id": 231, "wasted": false, "option1": "Gothic 2", "option2": "Sim City 2000" },
            { "stage": "Viertelfinale", "id": 170, "wasted": false, "option1": "Mass Effect 2", "option2": "Sim City 2000" },
            { "stage": "Viertelfinale", "id": 210, "wasted": false, "option1": "Anstoss 2", "option2": "Red Dead Redemption" },
            { "stage": "Viertelfinale", "id": 187, "wasted": false, "option1": "Day of the Tentacle", "option2": "XCOM 2" },
            { "stage": "Viertelfinale", "id": 154, "wasted": false, "option1": "Gothic 2", "option2": "Uncharted 2" },
            { "stage": "Indie-Edition: Nidhogg 2 vs Thirty Flights of Loving", "id": 321, "wasted": false },
            { "stage": "Welches Spiel aus dieser Staffel habt ihr zuletzt gespielt?", "id": 256, "wasted": false }
        ]
    },
    {
        "nr": 3,
        "name": "Überschätztestes Spiel",
        "topics": [
            { "stage": "Finale", "id": 392, "wasted": false, "option1": "Zelda: Breath of the Wild", "option2": "Red Dead Redemption 2" },
            { "stage": "Halbfinale", "id": 372, "wasted": false, "option1": "Journey", "option2": "Red Dead Redemption 2", "poll_index": 1 },
            { "stage": "Halbfinale", "id": 372, "wasted": false, "option1": "Zelda: Breath of the Wild", "option2": "Dragon Age: Inquisition", "poll_index": 0 },
            { "stage": "Viertelfinale", "id": 316, "wasted": false, "option1": "Dragon Age: Inquisition", "option2": "Fallout 3" },
            { "stage": "Viertelfinale", "id": 359, "wasted": false, "option1": "Skyrim", "option2": "Red Dead Redemption 2" },
            { "stage": "Viertelfinale", "id": 343, "wasted": false, "option1": "Journey", "option2": "Spec Ops: The Line" },
            { "stage": "Viertelfinale", "id": 293, "wasted": false, "option1": "The Witness", "option2": "Zelda: Breath of the Wild" },
            { "stage": "Community Wildcard", "id": 294, "wasted": false }
        ]
    },
    {
        "nr": 4,
        "name": "Bestes Spielejahr",
        "topics": [
            { "stage": "Finale", "id": 512, "wasted": false, "option1": "1992", "option2": "1998" },
            { "stage": "Halbfinale", "id": 506, "wasted": false, "option1": "1992", "option2": "2000", "poll_index": 1 },
            { "stage": "Halbfinale", "id": 506, "wasted": false, "option1": "1996", "option2": "1998", "poll_index": 0 },
            { "stage": "Viertelfinale", "id": 471, "wasted": false, "option1": "2000", "option2": "2003" },
            { "stage": "Viertelfinale", "id": 415, "wasted": false, "option1": "1996", "option2": "1984" },
            { "stage": "Viertelfinale", "id": 451, "wasted": false, "option1": "1992", "option2": "2001" },
            { "stage": "Viertelfinale", "id": 439, "wasted": false, "option1": "1998", "option2": "2007" },
            { "stage": "Community Wildcards", "id": 418, "wasted": false }
        ]
    },
    {
        "nr": 5,
        "name": "Bestes Spiel des Jahrzehnts",
        "topics": [
            { "stage": "Finale", "id": 924, "wasted": false, "option1": "Fallout: New Vegas", "option2": "The Witcher 3" },
            { "stage": "Halbfinale", "id": 917, "wasted": false, "option1": "The Witcher 3", "option2": "Minecraft", "poll_index": 1 },
            { "stage": "Halbfinale", "id": 917, "wasted": false, "option1": "Fallout: New Vegas", "option2": "Cities: Skylines", "poll_index": 0 },
            { "stage": "Viertelfinale", "id": 853, "wasted": false, "option1": "Cities: Skylines", "option2": "The Last of Us" },
            { "stage": "Viertelfinale", "id": 861, "wasted": false, "option1": "Minecraft", "option2": "Darkest Dungeon" },
            { "stage": "Viertelfinale", "id": 860, "wasted": false, "option1": "Papers, Please", "option2": "The Witcher 3" },
            { "stage": "Viertelfinale", "id": 849, "wasted": false, "option1": "Frostpunk", "option2": "Fallout: New Vegas" },
            { "stage": "Achtelfinale", "id": 750, "wasted": false, "option1": "The Witcher 3", "option2": "PUBG" },
            { "stage": "Achtelfinale", "id": 617, "wasted": false, "option1": "Fallout: New Vegas", "option2": "Rocket League" },
            { "stage": "Achtelfinale", "id": 713, "wasted": false, "option1": "Papers, Please", "option2": "Hollow Knight" },
            { "stage": "Achtelfinale", "id": 664, "wasted": false, "option1": "Cities: Skylines", "option2": "Banner Saga" },
            { "stage": "Achtelfinale", "id": 687, "wasted": false, "option1": "Dota 2", "option2": "The Last of Us" },
            { "stage": "Achtelfinale", "id": 586, "wasted": false, "option1": "Kentucky Route Zero", "option2": "Frostpunk" },
            { "stage": "Achtelfinale", "id": 767, "wasted": false, "option1": "Minecraft", "option2": "Crusader Kings 2" },
            { "stage": "Achtelfinale", "id": 800, "wasted": false, "option1": "Darkest Dungeon", "option2": "Darkest Dungeon" },
            { "stage": "Community Picks", "id": 585, "wasted": false },
            { "stage": "Stichwahl zur Abstimmung über das Abtimmungsprozedere bezüglich der Community-Picks", "id": 574, "wasted": false }
        ]
    },
    {
        "nr": 6,
        "name": "Beste Designerin",
        "topics":[
            { "stage": "Finale", "id": 1204, "wasted": false, "option1": "Danielle Bunten", "option2": "Brenda Romero" },
            { "stage": "Halbfinale", "id": 1202, "wasted": false, "option1": "Brenda Romero", "option2": "Amy Hennig", "poll_index": 1 },
            { "stage": "Halbfinale", "id": 1202, "wasted": false, "option1": "Danielle Bunten", "option2": "Roberta Williams", "poll_index": 0 },
            { "stage": "Viertelfinale", "id": 1189, "wasted": false, "option1": "Roberta Williams", "option2": "Jade Raymond" },
            { "stage": "Viertelfinale", "id": 1160, "wasted": false, "option1": "Danielle Bunten", "option2": "Kim Swift" },
            { "stage": "Viertelfinale", "id": 1144, "wasted": false, "option1": "Brenda Romero", "option2": "Aya Kyogoku" },
            { "stage": "Viertelfinale", "id": 1131, "wasted": false, "option1": "Kellee Santiago", "option2": "Amy Hennig", "poll_index": 0 },
            { "stage": "Communitypicks", "id": 1131, "wasted": false, "poll_index": 1 }
        ]
    },
    {
        "nr": 7,
        "name": "Bestes Strategiespiel",
        "topics": [
            { "stage": "Finale", "id": 1410, "wasted": false, "option1": "Civilization 2", "option2": "XCOM 2" },
            { "stage": "Halbfinale", "id": 1395, "wasted": false, "option1": "XCOM 2", "option2": "Stellaris", "poll_index": 1 },
            { "stage": "Halbfinale", "id": 1395, "wasted": false, "option1": "Die Siedler 2", "option2": "Civilization 2", "poll_index": 0 },
            { "stage": "Viertelfinale", "id": 1380, "wasted": false, "option1": "Stellaris", "option2": "Jagged Alliance 2" },
            { "stage": "Viertelfinale", "id": 1378, "wasted": false, "option1": "Die Siedler 2", "option2": "Age of Empires 2" },
            { "stage": "Viertelfinale", "id": 1379, "wasted": false, "option1": "XCOM 2", "option2": "Anno 1800" },
            { "stage": "Viertelfinale", "id": 1375, "wasted": false, "option1": "Plants vs. Zombies", "option2": "Civilization 2" },
            { "stage": "Achtelfinale", "id": 1364, "wasted": false, "option1": "Jagged Alliance 2", "option2": "Heroes of Might and Magic 3" },
            { "stage": "Achtelfinale", "id": 1334, "wasted": false, "option1": "Total War: Empire", "option2": "Anno 1800" },
            { "stage": "Achtelfinale", "id": 1321, "wasted": false, "option1": "Warcraft 3: The Frozen Throne", "option2": "Civilization 2" },
            { "stage": "Achtelfinale", "id": 1279, "wasted": false, "option1": "Die Siedler 2", "option2": "Starcraft: Brood War" },
            { "stage": "Achtelfinale", "id": 1311, "wasted": false, "option1": "Homeworld", "option2": "Plants vs. Zombies" },
            { "stage": "Achtelfinale", "id": 1252, "wasted": false, "option1": "Age of Empires 2", "option2": "Mount and Blade: Warband" },
            { "stage": "Achtelfinale", "id": 1355, "wasted": false, "option1": "BattleTech", "option2": "XCOM 2" },
            { "stage": "Achtelfinale", "id": 1340, "wasted": false, "option1": "Dawn of War 2", "option2": "Stellaris" }
        ]
    },
    {
        "nr": 8,
        "name": "Bester NPC",
        "topics": [
            { "stage": "Finale", "id": 1651, "wasted": false, "option1": "Stan (Monkey Island)", "option2": "Patches (Dark Souls)" },
            { "stage": "Halbfinale", "id": 1648, "wasted": false, "option1": "Patches (Dark Souls)", "option2": "Der Esel aus Dungeon Siege" },
            { "stage": "Halbfinale", "id": 1647, "wasted": false, "option1": "Murray (Monkey Island 3)", "option2": "Stan (Monkey Island)" },
            { "stage": "Viertelfinale", "id": 1632, "wasted": false, "option1": "Patches (Dark Souls)", "option2": "Repo-man (The Sims)" },
            { "stage": "Viertelfinale", "id": 1620, "wasted": false, "option1": "Boo (Baldurs Gate 2)", "option2": "Der Esel aus Dungeon Siege" },
            { "stage": "Viertelfinale", "id": 1609, "wasted": false, "option1": "Garrus (Mass Effect)", "option2": "Stan (Monkey Island)" },
            { "stage": "Viertelfinale", "id": 1558, "wasted": false, "option1": "Frida (Skyrim)", "option2": "Murray (Monkey Island 3)" },
            { "stage": "Community-Picks", "id": 1604, "wasted": false }
        ]
    },
    {
        "nr": 9,
        "name": "Bestes Gamesbundesland",
        "topics": [
            { "stage": "Finale", "id": 1861, "wasted": false, "option1": "Berlin", "option2": "Rheinland-Pfalz" },
            { "stage": "Halbfinale", "id": 1854, "wasted": false, "option1": "Hamburg", "option2": "Berlin" },
            { "stage": "Halbfinale", "id": 1855, "wasted": false, "option1": "Rheinland-Pfalz", "option2": "Hessen" },
            { "stage": "Viertelfinale", "id": 1851, "wasted": false, "option1": "Berlin", "option2": "Saarland" },
            { "stage": "Viertelfinale", "id": 1852, "wasted": false, "option1": "Rheinland-Pfalz", "option2": "Niedersachsen" },
            { "stage": "Viertelfinale", "id": 1853, "wasted": false, "option1": "Bayern", "option2": "Hessen" },
            { "stage": "Viertelfinale", "id": 1850, "wasted": false, "option1": "Meck-Pomm", "option2": "Hamburg" },
            { "stage": "Achtelfinale", "id": 1838, "wasted": false, "option1": "Thüringen", "option2": "Hessen" },
            { "stage": "Achtelfinale", "id": 1834, "wasted": false, "option1": "Bayern", "option2": "Schleswig-Holstein" },
            { "stage": "Achtelfinale", "id": 1815, "wasted": false, "option1": "Brandenburg", "option2": "Niedersachsen" },
            { "stage": "Achtelfinale", "id": 1792, "wasted": false, "option1": "Rheinland-Pfalz", "option2": "Baden-Württemberg" },
            { "stage": "Achtelfinale", "id": 1776, "wasted": false, "option1": "Saarland", "option2": "Bremen" },
            { "stage": "Achtelfinale", "id": 1769, "wasted": false, "option1": "Sachsen-Anhalt", "option2": "Berlin" },
            { "stage": "Achtelfinale", "id": 1755, "wasted": false, "option1": "Sachsen", "option2": "Hamburg" },
            { "stage": "Achtelfinale", "id": 1748, "wasted": false, "option1": "NRW", "option2": "Meck-Pomm" },
            { "stage": "Bonus", "id": 1858, "wasted": false }
        ]
    },
    {
        "nr": 10,
        "name": "Beste Rollenspiel aller Zeiten",
        "topics": [
            { "stage": "Achtelfinale", "id": 579, "wasted": true, "option1": "Baldurs Gate 2", "option2": "The Elder Scrolls III: Morrowind" },
            { "stage": "Achtelfinale", "id": 635, "wasted": true, "option1": "Fallout: New Vegas", "option2": "Candy Box 2" },
            { "stage": "Community Umfrage", "id": 647, "wasted": true }
        ]
    },
    {
        "nr": "",
        "name": "Bonusfolgen",
        "topics": [
            { "stage": "Geilste Gaming-Aktie", "id": 534, "wasted": false },
            { "stage": "Beste Fehlwertung", "id": 1717, "wasted": false },
            { "stage": "Wird das geil? Die E3-Edition", "id": 1697, "wasted": false },
            { "stage": "Beste Kneipe!", "id": 1677, "wasted": false },
            { "stage": "Bestes JRPG für Normies!", "id": 1674, "wasted": false },
            { "stage": "Was ist dümmer? Cyberpunk 2077 eine 9.6 geben - oder zu wenig Impfstoff bestellen?", "id": 1501, "wasted": false },
            { "stage": "Das nervigste Wort im deutschen Spielejournalismus", "id": 1471, "wasted": false },
            { "stage": "Beste The Sims-Erweiterung", "id": 1476, "wasted": false },
            { "stage": "Beste Cyberpunk 2077-Rezension", "id": 1495, "wasted": false },
            { "stage": "Bester Flop?", "id": 1450, "wasted": false },
            { "stage": "Bestes Gaming-Abo?", "id": 461, "wasted": false },
            { "stage": "Geilste Gaming-Aktie Oktober 2020", "id": 1446, "wasted": false },
            { "stage": "Das ungerechteste Spiel", "id": 1039, "wasted": false },
            { "stage": "Was ist das beste Podcastspiel?", "id": 1029, "wasted": false },
            { "stage": "Was ist der beste Wald?", "id": 991, "wasted": false },
            { "stage": "So werden die 20er Jahre! (ganz bestimmt)", "id": 920, "wasted": false },
            { "stage": "Deutschestes Spiel?", "id": 1013, "wasted": false },
            { "stage": "Bestes Besäufnis in einem Computerspiel?", "id": 817, "wasted": false },
            { "stage": "Bester Charakter-Editor", "id": 832, "wasted": false },
            { "stage": "Wer ist der Rollenspiel-Messias? Disco Elysium oder The Outer Worlds", "id": 669, "wasted": false },
            { "stage": "Bestes Kater-Spiel", "id": 537, "wasted": false },
            { "stage": "Lost Levels vs. Indie Fresse", "id": 414, "wasted": false },
            { "stage": "Wer hat die E3 gewonnen?", "id": 315, "wasted": false },
            { "stage": "Freundschaftsspiel: Bestes Fußballspiel aller Zeiten?", "id": 180, "wasted": false },
            { "stage": "Was ist geiler? Fallout 76 oder Anthem?", "id": 134, "wasted": false },
            { "stage": "Beste Gamescom-Halle", "id": 500, "wasted": false },
            { "stage": "Crossover: Der NPC als Meme", "id": 1597, "wasted": false }
        ]
    },
    {
        "nr": "",
        "name": "Wer hat den Gürtel",
        "topics": [
            { "stage": "Januar 2022", "id": 1003, "wasted": true },
            { "stage": "Gürtel der Herzen 2021", "id": 762, "wasted": true },
            { "stage": "Jahresgürtel 2021", "id": 760, "wasted": true },
            { "stage": "Dezember 2021", "id": 727, "wasted": true },
            { "stage": "November 2021", "id": 412, "wasted": true },
            { "stage": "Oktober 2021", "id": 1826, "wasted": false },
            { "stage": "September 2021", "id": 1783, "wasted": false },
            { "stage": "August 2021", "id": 1764, "wasted": false },
            { "stage": "Juli 2021", "id": 1726, "wasted": false },
            { "stage": "Juni 2021", "id": 1703, "wasted": false },
            { "stage": "Mai 2021", "id": 1679, "wasted": false },
            { "stage": "April 2021", "id": 1669, "wasted": false },
            { "stage": "März 2021", "id": 1646, "wasted": false },
            { "stage": "Februar 2021", "id": 1624, "wasted": false },
            { "stage": "Jahresgürtel 2020", "id": 1586, "wasted": false },
            { "stage": "Januar 2021", "id": 1584, "wasted": false },
            { "stage": "Dezember 2020", "id": 1517, "wasted": false },
            { "stage": "November 2020", "id": 1481, "wasted": false },
            { "stage": "Oktober 2020", "id": 1457, "wasted": false },
            { "stage": "Dürfen Remakes in WHDG?", "id": 1431, "wasted": false },
            { "stage": "November 2019", "id": 824, "wasted": false },
            { "stage": "September 2020", "id": 1432, "wasted": false },
            { "stage": "August 2020", "id": 1415, "wasted": false },
            { "stage": "Juli 2020", "id": 1383, "wasted": false },
            { "stage": "Wer hat den (wahren) Gürtel? Juni 2020", "id": 1344, "wasted": false },
            { "stage": "Juni 2020", "id": 1345, "wasted": false },
            { "stage": "Mai 2020", "id": 1319, "wasted": false },
            { "stage": "April 2020", "id": 1233, "wasted": false },
            { "stage": "März 2020", "id": 1172, "wasted": false },
            { "stage": "April/Mai 2019", "id": 326, "wasted": false },
            { "stage": "Februar 2020", "id": 1114, "wasted": false },
            { "stage": "Jahresgürtel 2019", "id": 1066, "wasted": false },
            { "stage": "Januar 2020", "id": 1045, "wasted": false },
            { "stage": "Dezember 2019", "id": 979, "wasted": false },
            { "stage": "Oktober 2019", "id": 706, "wasted": false },
            { "stage": "September 2019", "id": 542, "wasted": false },
            { "stage": "August 2019", "id": 525, "wasted": false },
            { "stage": "Juli 2019", "id": 452, "wasted": false },
            { "stage": "Juni 2019", "id": 375, "wasted": false },
            { "stage": "März 2019", "id": 217, "wasted": false },
            { "stage": "Februar 2019", "id": 146, "wasted": false }
        ]
    },
    {
        "nr": "",
        "name": "Superleague/Top5",
        "topics": [
            { "stage": "Das Spielejahr 2009", "id": 1807, "wasted": false },
            { "stage": "Das Spielejahr 2006", "id": 1738, "wasted": false },
            { "stage": "Das Spielejahr 2001", "id": 1711, "wasted": false },
            { "stage": "Das Spielejahr 2011", "id": 1687, "wasted": false },
            { "stage": "Das Spielejahr 1998", "id": 1661, "wasted": false },
            { "stage": "Die besten Remakes, Reboots und Remasters", "id": 540, "wasted": true},
            { "stage": "Pandemiespiele", "id": 732, "wasted": true}
        ]
    }
];

module.exports = staffeln;