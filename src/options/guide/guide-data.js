// In-game walkthrough data, transcribed from the route flowcharts (Common, Fate, Unlimited Blade Works, Heaven's Feel).
//
// Item shapes
//   {type: "choice", where, minor?, note?, options: [{t, r, fx?, bad?, pick?, when?}]}
//        t    the option as shown in the game
//        r    the scene it leads to
//        fx   flag changes, e.g. ["Saber +1"]
//        bad  {n, name}: a Tiger Dojo bad end (n = its number, name = the scene that triggers it)
//        pick true when this is the option you want
//        when a condition that decides whether the option is offered
//   {type: "check", where, cond, yes, no, note?}   an automatic branch (no player input)
//   {type: "note", text}

const B = (n, name) => ({n, name})

export const ROUTES = [
  {
    id: "overview",
    label: "Overview",
    short: "How routes unlock, and how to read this guide",
  },
  {
    id: "common",
    label: "Common",
    short: "Days 1 – 3",
    accent: "#e6cf8a",
    intro: "Shared opening. Your choices here decide which route you can enter, so a few of them matter even though nothing looks dangerous.",
    key: [
      "Fate is the default route. Clear it first.",
      "UBW: after clearing Fate, choose \"Stop.\" on Day 3.",
      "Heaven's Feel: needs Heaven's Feel = 3 by Day 3 night (three specific choices, see Day 1 – 2), and UBW cleared.",
    ],
    days: [
      {
        day: "Day 1", title: "One Day I",
        items: [
          {type: "choice", where: "Morning", options: [
            {t: "I'll go help Sakura.", r: "Morning chores / Sakura Matou (I)", fx: ["Sakura +1"], pick: true, note: "Needed for Heaven's Feel (Sakura = 1)."},
            {t: "I'll take care of my daily tasks.", r: "Morning training / Dojo view", fx: ["Dojo Explanation = 1"]},
          ]},
          {type: "choice", where: "After school", options: [
            {t: "I'll help the student council.", r: "Out of one's league", fx: ["Rin +1"], pick: true},
            {t: "I'll go to my part-time job.", r: "Brownie"},
          ]},
          {type: "choice", where: "After dinner / Good work today.", options: [
            {t: "I'll walk Sakura home.", r: "Taking Sakura home: expert (if UBW is cleared), otherwise \"beginner\"", fx: ["Heaven's Feel +1 (only if UBW cleared)"], pick: true, note: "Heaven's Feel route only."},
            {t: "I'll hang out with Fuji-nee.", r: "The Mandarinians Strike Back"},
            {t: "I'll rest.", r: "Good work once again."},
          ]},
        ],
      },
      {
        day: "Day 2", title: "One Day II",
        items: [
          {type: "check", where: "Morning", cond: "Sakura = 1 AND Heaven's Feel = 1", yes: "Waking up / Minor change: a choice appears (below)", no: "Normal morning at the Emiya house"},
          {type: "choice", where: "Waking up / Minor change", options: [
            {t: "Sakura's coming, so I should add another dish.", r: "Making breakfast with Sakura / Omen", fx: ["Heaven's Feel +1"], pick: true},
            {t: "I should do my morning routine at the dojo.", r: "Morning / Dojo scenery"},
          ]},
          {type: "check", where: "After school", cond: "Heaven's Feel = 2", yes: "Decision: a choice appears (below)", no: "After school / Pipeline"},
          {type: "choice", where: "After school / Decision", options: [
            {t: "Explain everything to Sakura.", r: "Sakura's classroom / Sakura Matou (II)", fx: ["Heaven's Feel +1"], pick: true, note: "Brings you to Heaven's Feel = 3."},
            {t: "Go meet Tohsaka.", r: "Part-time job / Rin Tohsaka (I)"},
          ]},
        ],
      },
      {
        day: "Day 3", title: "Long day, long night",
        items: [
          {type: "check", where: "Morning", cond: "Heaven's Feel > 1", yes: "Morning ~ School commute / Worsening bruise", no: "Morning ~ School commute / Unnatural bruise", note: "Only changes a scene."},
          {type: "check", where: "After Lancer's fight", cond: "Fate route cleared AND Heaven's Feel < 3", yes: "You get a choice: \"Don't stop.\" or \"Stop.\"", no: "Continues to Master lecture"},
          {type: "choice", where: "Summoning Saber. VS Lancer", note: "Only offered once Fate is cleared and Heaven's Feel is below 3.", options: [
            {t: "Stop.", r: "Go to Unlimited Blade Works route, Day 3", pick: true, note: "This is how you enter UBW."},
            {t: "Don't stop.", r: "Master lecture / Rin Tohsaka (II), the normal route continues"},
          ]},
          {type: "choice", where: "Kotomine's church / Alter ego", options: [
            {t: "...Fight.", r: "Determination / The strongest enemy", pick: true},
            {t: "...Destroy the seal.", r: "Night / Forest of no return", bad: B(1, "Forest of no return")},
          ]},
          {type: "choice", where: "The strongest enemy", options: [
            {t: "I'll help Saber...!", r: "Last / Distortion (I)", pick: true},
            {t: "I'll take Tohsaka and run...!", r: "Late night / Golden canary basket", bad: B(2, "Golden canary basket")},
          ]},
          {type: "check", where: "End of Day 3", cond: "Heaven's Feel = 3", yes: "Interlude / Abyssal worm, then the Heaven's Feel route", no: "The Fate route"},
        ],
      },
    ],
  },

  {
    id: "fate",
    label: "Fate",
    short: "Saber's route, Days 4 – 15",
    accent: "#a8c3eb",
    ending: "Fate / True End: Continuation of the Dream",
    intro: "Saber's route. It is mostly about earning Saber's trust and avoiding a handful of bad ends.",
    key: [
      "Saber needs at least 6 points when you reach the church basement on Day 15, or you get Tiger Dojo 13.",
      "Day 4: accept Rin's offer (\"Got it. Let's team up.\"). Declining leads to a dead-end branch in UBW.",
      "Day 15 night: hold a strategy meeting and return the sheath to Saber.",
      "Saber points available: D4 +1, D7 – 8 up to +3, D8 home +1, D9 +2, D10 +2, D11 +1 and +1.",
    ],
    days: [
      {
        day: "Day 4", title: "Partner",
        items: [
          {type: "choice", where: "Rin's question", minor: true, options: [
            {t: "Let's talk about yesterday.", r: "Grasping the situation", fx: ["Rin +1"]},
            {t: "Let's start with the serious stuff.", r: "Serious talk"},
            {t: "I have a bad feeling. I don't want to hear either of them.", r: "Invitation declined"},
          ]},
          {type: "choice", where: "Morning / Rin's proposal", options: [
            {t: "Got it. Let's team up.", r: "Pact struck", pick: true},
            {t: "Sorry, but we can't team up.", r: "Solo & only, goes to the UBW route (Day 4)", fx: ["Solo = 1"], note: "In UBW this leads to Tiger Dojo 16 on Day 5. Avoid it."},
          ]},
          {type: "choice", where: "Before noon / Saber (I)", options: [
            {t: "Where did you get those clothes?", r: "Funny dress", fx: ["Saber +1"], pick: true},
            {t: "Are you okay?", r: "No need for concern", minor: true},
            {t: "What hero is Saber?", r: "Afternoon / Saber's circumstances", minor: true},
          ]},
        ],
      },
      {
        day: "Day 5", title: "New life",
        items: [
          {type: "choice", where: "Lunch break / Decision", note: "Only Rin is affected, and Rin does not gate anything in this route.", options: [
            {t: "I'm worried about Tohsaka.", r: "Rin Tohsaka (IV)", fx: ["Rin +1"]},
            {t: "I'm worried about Sakura.", r: "Sakura Matou (III) ~ Demon god rages", fx: ["Rin -1"]},
          ]},
          {type: "choice", where: "Evening / Question for Saber", minor: true, options: [
            {t: "About Lancer.", r: "Question / Survivor"},
            {t: "About Archer.", r: "Question / Unknown"},
            {t: "About Berserker.", r: "Question / Vella Gulf"},
          ]},
        ],
      },
      {
        day: "Day 6", title: "Blade",
        items: [
          {type: "choice", where: "Shinji's invitation, falling out", minor: true, options: [
            {t: "Talk to Rider.", r: "Return home to Matou house / Iron maiden"},
            {t: "Stay away from danger.", r: "Return home to Matou house / Not meeting eyes"},
          ]},
          {type: "choice", where: "Strategy meeting. Should we attack Ryudou Temple?", options: [
            {t: "Don't fight.", r: "Night / Discord", pick: true},
            {t: "Fight.", r: "Late night ~ Ryudou Temple / Missing Ariadne", bad: B(3, "Missing Ariadne")},
          ]},
        ],
      },
      {
        day: "Day 7", title: "Sword & Magic (I)",
        items: [
          {type: "choice", where: "Morning sword training / Life guard", note: "Your pick sets the variable Question, which changes the choices on Day 8.", options: [
            {t: "The reason to fight. I want to know why she seeks the Holy Grail.", r: "Filling the Grail", fx: ["Saber +2", "Question = 1"], pick: true},
            {t: "I want to know more about Saber before she became a Servant.", r: "Heroic epic", fx: ["Saber +1", "Question = 2"], pick: true},
            {t: "I need a trump card. It'd be nice to have some sort of secret blade technique or something.", r: "Miss Saber is outraged", fx: ["Question = 3"]},
          ]},
        ],
      },
      {
        day: "Day 8", title: "Sword & Magic (II)",
        items: [
          {type: "choice", where: "Morning ~ Sword training", note: "Which two options you see depends on your Day 7 pick (Question). The best total for Days 7 + 8 is +3.", options: [
            {when: "Question = 1", t: "I want to know more about Saber before she became a Servant.", r: "Heroic epic", fx: ["Saber +1"], pick: true},
            {when: "Question = 1", t: "A secret blade technique for dummies.", r: "Miss Saber is outraged"},
            {when: "Question = 2", t: "I want to know what Saber's fighting for.", r: "Filling the Grail", fx: ["Saber +2"], pick: true},
            {when: "Question = 2", t: "A secret blade technique even crabs can use.", r: "Miss Saber is outraged"},
            {when: "Question = 3", t: "I want to know why Saber fights.", r: "Filling the Grail", fx: ["Saber +2"], pick: true},
            {when: "Question = 3", t: "I want to know more about Saber before she became a Servant.", r: "Heroic epic", fx: ["Saber +1"]},
          ]},
          {type: "choice", where: "Noon / Shopping district", options: [
            {t: "Go straight home to the Emiya house.", r: "Lunch / Country girl Saber", fx: ["Saber +1"], pick: true},
            {t: "Swing by the park.", r: "Winter girl ~ Illya (II)", fx: ["Illya +1"], note: "Illya does not gate this route."},
          ]},
          {type: "choice", where: "Before dinner / Decision", minor: true, options: [
            {t: "She's actually going to force me to make a pie. I should hide out for a while.", r: "Evening / Funny Lion"},
            {t: "Don't worry about the apples. Fuji-nee, eat some tangerines.", r: "Evening / Golden bath"},
            {t: "Fuji-nee, where's my gift?", r: "Evening / Orange Pekoe Monster"},
          ]},
        ],
      },
      {
        day: "Day 9", title: "NEO",
        items: [
          {type: "choice", where: "Morning ~ Sword training", minor: true, options: [
            {t: "I'll wait patiently.", r: "Let's Hachiko Digression"},
            {t: "I'll go call Tohsaka.", r: "\"Works\""},
          ]},
          {type: "choice", where: "VS Rider (I)", minor: true, options: [
            {t: "I don't need to stop...!", r: "Attack"},
            {t: "I can't prevent it on my own!", r: "Defense"},
          ]},
          {type: "choice", where: "VS Rider (I) / Sparks", options: [
            {t: "This isn't going to be a battle.", r: "Fall down, your mind", pick: true},
            {t: "I'll defeat it before I get defeated...!", r: "Melty blood", bad: B(4, "Melty blood")},
          ]},
          {type: "choice", where: "VS Rider (I) / Fall down, your mind", options: [
            {t: "I'll summon Saber!", r: "Summoning Saber", fx: ["Saber +2"], pick: true},
            {t: "I need Saber to come save me!", r: "Summoning and rescue"},
            {t: "I can't! I can't waste my Command Spells!", r: "Rafflesia umbrella", bad: B(5, "Rafflesia umbrella")},
          ]},
        ],
      },
      {
        day: "Day 10", title: "Skyscraper",
        items: [
          {type: "choice", where: "VS Rider (II) / Assault", options: [
            {t: "I need to follow Saber!", r: "Death Circus", pick: true},
            {t: "Wait here.", r: "Morning / The Nutcracker", bad: B(6, "The Nutcracker")},
          ]},
          {type: "choice", where: "Sword of Promised Victory", options: [
            {t: "Rush up to Saber.", r: "Boy meets girl (III)", fx: ["Saber +2"], pick: true},
            {t: "Follow Shinji.", r: "Signs of a tragedy"},
          ]},
        ],
      },
      {
        day: "Day 11", title: "DragonSlay",
        items: [
          {type: "choice", where: "Morning park / White cursed eyes ~ Illya (III)", options: [
            {t: "I can't do that.", r: "Rejection and escape", pick: true},
            {t: "I'll have to agree for now.", r: "Einzbern Castle / Dress of Heaven", bad: B(7, "Dress of Heaven")},
          ]},
          {type: "choice", where: "Einzbern Castle / Rejection and escape", options: [
            {t: "I just have to fight. The moment the door opens, I make the first move.", r: "Feeble resistance", fx: ["Saber +1"], pick: true},
            {t: "...I'm in no state to fight. I'll sit in the chair and pretend I'm tied up.", r: "Find a way out", fx: ["Rin +1"]},
            {t: "...What about that bed over there?", r: "Murder in the doll room"},
          ]},
          {type: "choice", where: "Dawn in the ruins", options: [
            {t: "I'm worried about Saber.", r: "Boy meets girl (IV)", fx: ["Saber +1"], pick: true},
            {t: "I'm worried about Tohsaka.", r: "Gold rush?", fx: ["Rin +1"]},
          ]},
          {type: "choice", where: "VS Berserker / Reviving a myth", minor: true, options: [
            {t: "Provide backup with my bow!", r: "Feeble resistance"},
            {t: "What will that do?", r: "Finding a way to survive"},
          ]},
          {type: "choice", where: "VS Berserker / Twelve Labors", options: [
            {t: "Don't use it!", r: "And thus I pray, Unlimited Blade Works.", pick: true},
            {t: "Is that really our choice?", r: "A night without dawn", bad: B(8, "A night without dawn")},
          ]},
        ],
      },
      {
        day: "Day 12", title: "Interval Level 4",
        items: [
          {type: "choice", where: "Breakfast / Hamburg steak war", minor: true, options: [
            {t: "Shelter Illya.", r: "Saber pouts"},
            {t: "Take her to the church.", r: "Illya pouts"},
          ]},
          {type: "choice", where: "Saber's being weird", minor: true, options: [
            {t: "Okay, let's have lunch.", r: "Agree honestly"},
            {t: "Fine, but why is she on the dot today?", r: "Saber blushes"},
            {t: "No can do. We'll be fasting today.", r: "Brave Leader Hungryheart"},
          ]},
          {type: "choice", where: "Magecraft lecture", minor: true, options: [
            {t: "Ask about Projection in more detail.", r: "All About: Projection magecraft"},
            {t: "Question one.", r: "All About: You're tough"},
            {t: "Silence is golden.", r: "All About: Silence is golden, apparently"},
          ]},
        ],
      },
      {
        day: "Day 13", title: "Infinity arms",
        items: [
          {type: "choice", where: "Night / VS Caster", options: [
            {t: "Saber and I will both head out.", r: "VS Caster / Melee", pick: true},
            {t: "I'll leave Caster to Saber and protect the two here.", r: "Walpurgisnacht", bad: B(9, "Walpurgisnacht")},
          ]},
          {type: "choice", where: "VS Caster / Melee", options: [
            {t: "Believe in Tohsaka.", r: "Premonition", pick: true},
            {t: "I'll leave Caster to Saber.", r: "Walpurgisnacht", bad: B(9, "Walpurgisnacht")},
          ]},
          {type: "choice", where: "VS Caster / Premonition", options: [
            {t: "No, Saber!", r: "The eighth Servant", pick: true},
            {t: "You're in range, Saber!", r: "Witch's brand", bad: B(10, "Witch's brand")},
          ]},
        ],
      },
      {
        day: "Day 14", title: "Moonlight (I)",
        items: [
          {type: "choice", where: "VS Gilgamesh / What I want to protect", options: [
            {t: "I stand up.", r: "Wish", pick: true},
            {t: "I don't get up.", r: "One conclusion", bad: B(11, "One conclusion")},
          ]},
        ],
      },
      {
        day: "Day 15", title: "Utopia",
        items: [
          {type: "choice", where: "Getting up ~ to the church / Spiral Ladder", options: [
            {t: "Go down to the basement.", r: "Church basement / The price of survival", pick: true},
            {t: "Go back home.", r: "Morning / Time Limit", bad: B(12, "Time Limit")},
          ]},
          {type: "check", where: "Church basement / Discord", cond: "Saber < 6", yes: "Church basement / What cannot change: Tiger Dojo 13", no: "Church / Unyielding error, the story continues", bad: B(13, "What cannot change"), note: "You need at least 6 Saber points by now."},
          {type: "choice", where: "Return home ~ Rin / Decision", minor: true, options: [
            {t: "But still, Tohsaka.", r: "Question / Nod"},
            {t: "Is there a method?", r: "Question / Ask"},
          ]},
          {type: "choice", where: "Night / Before the decisive battle", note: "Only the strategy meeting leads to the good ending.", options: [
            {t: "Have a strategy meeting.", r: "Inside shed / Strategy meeting (a second choice follows)", pick: true},
            {t: "Report to Kiritsugu.", r: "Night / Determination", bad: B(14, "Completing the Holy Grail")},
            {t: "Spend time with Saber.", r: "Night / Final lesson", bad: B(14, "Completing the Holy Grail")},
          ]},
          {type: "choice", where: "Inside shed / Strategy meeting", options: [
            {t: "Return the sheath to Saber.", r: "Returning the Sacred Sword, then Fate / True End", pick: true},
            {t: "Strengthen Saber.", r: "Unknown trump card", bad: B(14, "Completing the Holy Grail")},
            {t: "Look for a weapon.", r: "Unknown trump card", bad: B(14, "Completing the Holy Grail")},
          ]},
          {type: "note", text: "Ending: Fate / True End, \"Continuation of the Dream\"."},
        ],
      },
    ],
  },

  {
    id: "ubw",
    label: "Unlimited Blade Works",
    short: "Rin's route, Days 3 – 16",
    accent: "#f19c99",
    ending: "Good End: sunny day / True End: Brilliant Years",
    intro: "Rin's route. It is run on two counters, Rin and Saber, and a few story flags.",
    key: [
      "Enter from the Common route: clear Fate, then choose \"Stop.\" on Day 3. Do not enter through \"Sorry, but we can't team up\" on Fate Day 4: the Solo branch ends in Tiger Dojo 16.",
      "Day 12: you need Rin ≥ 3, or the story is forced into Tiger Dojo 21.",
      "Day 13: choose \"...Stop the man...!\" (\"Restrain myself\" sets Coward = 1, which ends in Tiger Dojo 23).",
      "Ending: Saber > 3 AND Rin < 9 gives the Good End (sunny day). Otherwise you get the True End (Brilliant Years).",
      "To aim for the True End, take every Rin option. For the Good End, take the Saber options and stay under Rin 9.",
      "Rin sources: D3 +1, D5 +1 (or −1), D7 +2, D8 +1, D9 +1, D10 +1, D13 +1, D15 +2 / +1. Saber sources: D3 +1, D5 +1, D8 +1, D10 +1, D15 +1.",
    ],
    days: [
      {
        day: "Day 3", title: "Long day, long night",
        items: [
          {type: "choice", where: "VS Berserker / Decision", options: [
            {t: "...Go after them.", r: "Equal battle ~ Archer's sniping", pick: true},
            {t: "...Stay here.", r: "Going somewhere (a second choice follows)"},
            {t: "Do as Tohsaka says.", r: "Third death", bad: B(15, "Third death")},
          ]},
          {type: "choice", where: "VS Berserker / Going somewhere", options: [
            {t: "...Go to the cemetery.", r: "Equal battle ~ Archer's sniping", pick: true},
            {t: "...Stay here.", r: "Third death", bad: B(15, "Third death")},
          ]},
          {type: "choice", where: "Equal battle ~ Archer's sniping", options: [
            {t: "Bring Saber back.", r: "Distortion (II)", fx: ["Saber +1", "Rin +1"], pick: true},
            {t: "Call Saber back.", r: "Calling her back", fx: ["No self-healing = 1"], note: "Only changes a few later scenes (self-healing)."},
          ]},
        ],
      },
      {
        day: "Day 4", title: "One day III",
        items: [
          {type: "check", where: "Conversation", cond: "No self-healing = 1", yes: "Conversation / Unscathed blind spot", no: "Conversation / Regeneration", note: "Only changes a scene."},
          {type: "choice", where: "Afternoon / School", minor: true, options: [
            {t: "Show Saber around school.", r: "School tour / Don't play with your sheath"},
            {t: "Stay at the archery range.", r: "Archery range / Standing shot"},
            {t: "Go to the student council room.", r: "Student council office / This breath"},
          ]},
        ],
      },
      {
        day: "Day 5", title: "Bonnie and Clyde",
        items: [
          {type: "choice", where: "Morning / Decision", options: [
            {t: "I'll go see how Saber's doing.", r: "Check on Saber", fx: ["Saber +1"], pick: true},
            {t: "I'll go help Sakura.", r: "Make breakfast with Sakura"},
            {t: "I'll go wake Fuji-nee up.", r: "Fuji-nee's wild ride"},
          ]},
          {type: "check", where: "School commute", cond: "Solo = 1 (you came in from Fate Day 4)", yes: "School / The price of pride, then After school / Texture: Tiger Dojo 16", no: "Normal school day, Rin Tohsaka (III)", bad: B(16, "Texture")},
          {type: "choice", where: "After school / Rin Tohsaka (III)", options: [
            {t: "Jump back to the hallway...!", r: "VS Rin Tohsaka / Panic sonic coaster", pick: true},
            {t: "Jump to the stairs...!", r: "After school / Texture", bad: B(16, "Texture")},
          ]},
          {type: "choice", where: "VS Rin Tohsaka / Panic sonic coaster", options: [
            {t: "Can I accept my loss against Tohsaka...?", r: "Staring contest", fx: ["Rin +1"]},
            {t: "Can I hand her my Command Spells...?", r: "Staring contest", fx: ["Rin -1"]},
          ]},
          {type: "choice", where: "Staring contest ~ To the grove ~ VS Rider", options: [
            {t: "Fight with my remaining left arm...!", r: "VS Rider / Counterattack", pick: true},
            {t: "If I pull out this \"nail\" stabbing my arm...!", r: "VS Rider / Hard fight", pick: true},
            {t: "Use my Command Spell.", r: "VS Rider / Spider's captive", bad: B(17, "Spider's captive")},
          ]},
          {type: "choice", where: "Night / Tell Saber that I'm working with Rin.", minor: true, options: [
            {t: "I guess that's how it'll be.", r: "Sleep / Agreement"},
            {t: "I can't say for sure.", r: "Sleep / Warning"},
          ]},
        ],
      },
      {
        day: "Day 6", title: "Faker",
        items: [
          {type: "choice", where: "Return home, before dinner", minor: true, options: [
            {t: "I'll stop Fuji-nee's wrongdoing before the sun sets and it's dinnertime.", r: "Okonomiyaki bowl off-limits"},
            {t: "I'll go see how Sakura's doing before the sun sets and it's dinnertime.", r: "Matou house / The Matou family"},
            {t: "I'll go tell Saber that I'm home before the sun sets and it's dinnertime.", r: "Dojo / Today's report"},
          ]},
        ],
      },
      {
        day: "Day 7", title: "Ghostwaltz",
        items: [
          {type: "choice", where: "School ~ Lunch break / Creeping evil shadow", minor: true, options: [
            {t: "...She's after me. I'll obediently go outside.", r: "Wise decision"},
            {t: "...She's after me. I don't want to die, so I'll keep quiet.", r: "Magical bullet shooter"},
            {t: "...Who is she after? I don't know, so I'll play dumb.", r: "Magical bullet shooter"},
          ]},
          {type: "choice", where: "Bounded Field activation / Decision", options: [
            {t: "Use my Command Spell to call for Saber.", r: "Second Command Spell", fx: ["Rin +2"], pick: true},
            {t: "Search for Shinji with the two of us.", r: "Rin's warning"},
          ]},
        ],
      },
      {
        day: "Day 8", title: "Interval Level 1",
        items: [
          {type: "choice", where: "Lunch break - Student council office", options: [
            {t: "...It'll be pointless, so I won't ask.", r: "Student council office / Don't pry", pick: true},
            {t: "...I'll try asking him.", r: "Student council office / Hypnos", bad: B(18, "Hypnos")},
          ]},
          {type: "choice", where: "After school / Decision.", options: [
            {t: "I'm worried about Sakura. I'll go to the Matou household.", r: "Suspicious duo", fx: ["Rin +1"], pick: true},
            {t: "Meat's on sale today. I'll make a big dinner to make Saber happy.", r: "Strange maid", fx: ["Saber +1"], pick: true},
            {t: "Oh yeah, I have to contact Tohsaka.", r: "Phone call"},
          ]},
        ],
      },
      {
        day: "Day 9", title: "My dear, stray dead",
        items: [
          {type: "choice", where: "Night / Ambush, execution", options: [
            {t: "...That's the only option.", r: "Ambush / Watch", fx: ["Rin +1"], pick: true},
            {t: "Actually, it's dangerous. I'll stop Tohsaka.", r: "Ambush / Stop her"},
          ]},
          {type: "choice", where: "Ambush / Defeat", options: [
            {t: "Protect Tohsaka...!", r: "Counterattack, Projection magecraft", pick: true},
            {t: "Go help Saber...!", r: "Ambush / Murderer", bad: B(19, "Murderer")},
          ]},
        ],
      },
      {
        day: "Day 10", title: "Strike lovers",
        items: [
          {type: "choice", where: "Before dinner / Fuji-nee VS Rin", options: [
            {t: "I have to go talk to Tohsaka.", r: "Night / About Projection", fx: ["Rin +1"], pick: true},
            {t: "I'll go talk to Saber at the dojo.", r: "Night - dojo / Wild Wild England", fx: ["Saber +1"], pick: true},
            {t: "It's cold, so I'll pass. Mandarin, mandarin, mandarin.", r: "Night - living room / Who do you like more?"},
          ]},
        ],
      },
      {
        day: "Day 11", title: "WitchCraft",
        items: [
          {type: "choice", where: "Early morning / The case of the missing sliced bread", minor: true, options: [
            {t: "I'll make Japanese cuisine since there's no bread. Actually, I'll teach the culprit a lesson.", r: "You're the culprit"},
            {t: "...I won't question what happened to the bread. I'll jog to the shopping district.", r: "Miyama's fastest legend"},
          ]},
          {type: "choice", where: "Early morning ~ guesthouse", minor: true, options: [
            {t: "Look inside.", r: "Rin's guestroom / Good morning?"},
            {t: "Well, I'm sure she's fine.", r: "To the shopping district / Lighting the life signal"},
          ]},
          {type: "choice", where: "Afternoon - return home / Caster attacks", options: [
            {t: "Refuse.", r: "Rejection / Distortion (III) ~ Rule Breaker", pick: true},
            {t: "Obey.", r: "Capsule / Haze", bad: B(20, "Haze")},
          ]},
        ],
      },
      {
        day: "Day 12", title: "Moonlight (II)",
        items: [
          {type: "check", where: "Interlude / Captive knight", cond: "Rin < 3", yes: "Forced church path: To battle / Information source, then Church / Bad luck (always Tiger Dojo 21)", no: "To battle / Decision", bad: B(21, "Man-made Noble Phantasm"), note: "You need at least 3 Rin points by now."},
          {type: "choice", where: "To battle / Decision", options: [
            {t: "Meet up with Tohsaka.", r: "To Shinto / Decoy search", pick: true},
            {t: "Go to church for advice.", r: "Church / Bad luck, all options end in Tiger Dojo 21", bad: B(21, "Man-made Noble Phantasm")},
          ]},
          {type: "choice", where: "Night ~ Church basement / Rin confronts Caster", options: [
            {t: "...Not yet. I can't act so recklessly.", r: "Confrontation / Desertion", pick: true},
            {t: "...I'll go out. I can give Tohsaka an opening now...!", r: "Church basement / Sword and spell", bad: B(22, "Sword and spell")},
          ]},
          {type: "choice", where: "Confrontation / Desertion", minor: true, options: [
            {t: "I'll go help her.", r: "Desperate Projection ~ Survival"},
            {t: "I won't help her.", r: "Bodily resistance"},
          ]},
          {type: "choice", where: "Strategy meeting / Is there a way to break the deadlock?", minor: true, options: [
            {t: "There's no such thing. The only thing is to break through from the front.", r: "Rin's smile / Scary"},
            {t: "We can't break through from the front. Is there any secret passage in the church?", r: "Rin's gloom / Serious"},
            {t: "It's impossible with just the two of us. We'll cooperate with other Masters.", r: "Rin's smile / Kinda cute"},
          ]},
        ],
      },
      {
        day: "Day 13", title: "VS Berserker",
        items: [
          {type: "choice", where: "Einzbern Castle / Gilgamesh VS Berserker", options: [
            {t: "...Stop the man...!", r: "Determination / Distortion (IV)", pick: true},
            {t: "...Restrain myself.", r: "Determination / Illya's death", fx: ["Coward = 1"], note: "Leads to Tiger Dojo 23 later this day."},
          ]},
          {type: "check", where: "Einzbern Castle / Puppeteer", cond: "Coward = 1", yes: "Night ~ To the church / A conclusion: Tiger Dojo 23", no: "Einzbern Castle / You're twisted, the story continues", bad: B(23, "A conclusion")},
          {type: "choice", where: "Einzbern Castle - sunset / Lancer's proposal", options: [
            {t: "...I don't mind, but under one condition.", r: "Offer to fight together / Lady Rin blushes", fx: ["Rin +1"], pick: true},
            {t: "...All right.", r: "Offer to fight together / Consent"},
            {t: "...I refuse.", r: "Offer to fight together / Decline"},
          ]},
        ],
      },
      {
        day: "Day 14", title: "Knight stay night",
        items: [
          {type: "choice", where: "Showdown, conclusion / Decision", minor: true, options: [
            {t: "...If I can stop them, why shouldn't I try?", r: "Decision / Ideals."},
            {t: "...Why should I stop them?", r: "Decision / Principles."},
          ]},
        ],
      },
      {
        day: "Day 15", title: "After image",
        items: [
          {type: "choice", where: "Return, night / Before the final battle", note: "Last chance for points. Rin counts toward the True End, Saber toward the Good End.", options: [
            {t: "Strategize with Tohsaka.", r: "Consult Rin", fx: ["Rin +2"]},
            {t: "Go to the dojo and check on Saber.", r: "Tea with Saber", fx: ["Saber +1"]},
            {t: "Think it over again.", r: "Think again", fx: ["Rin +1"]},
          ]},
        ],
      },
      {
        day: "Day 16", title: "EDEN",
        items: [
          {type: "check", where: "Holy Grail collapse", cond: "Saber > 3 AND Rin < 9", yes: "Interlude / A new wish, sets New wish = 1 and leads to the Good End", no: "Interlude / End of a dream, leads to the True End"},
          {type: "choice", where: "Conclusion / Last flight", options: [
            {t: "...Bullshit, I'm not going that easily...!", r: "Dawn / Stay away", pick: true},
            {t: "...Then I'll take you with me...!", r: "Circular circuit / Heaven's fall", bad: B(24, "Heaven's fall")},
          ]},
          {type: "note", text: "Endings: Good End \"sunny day\" (New wish = 1), otherwise True End \"Brilliant Years\"."},
        ],
      },
    ],
  },

  {
    id: "hf",
    label: "Heaven's Feel",
    short: "Sakura's route, Days 4 – Final",
    accent: "#c3a8d8",
    ending: "Normal End: Cherry Blossoms' Dream / True End: Return to the Spring",
    intro: "Sakura's route. It is the strictest of the three: Sakura, Illya and a few flags all have thresholds.",
    key: [
      "Sakura points must be ≥ 9 on Day 7 night (else Tiger Dojo 25) and ≥ 11 on Day 13 (else Tiger Dojo 35). Common route Sakura +1 counts. The Day 6 \"worried about Sakura\" choice (+5) is essential.",
      "Illya must be ≥ 3 on Day 8 (else Tiger Dojo 26). To get there you need Illya Talk = 2 by Day 7: do NOT pick \"I smell danger!\" on Day 5, and go shopping on Day 6.",
      "Day 9: do NOT choose \"...I have no choice.\" (it sets Geas = 1, which ends in Tiger Dojo 31).",
      "Day 12: choose \"...I nod.\". The other choice sets Blame = 1, which forces Tiger Dojo 35 on Day 13.",
      "True End: Illya ≥ 4 and Burst ≠ 1 (do not pick \"Use my next Projection...!\" on the Final Day). Otherwise you get the Normal End.",
    ],
    days: [
      {
        day: "Day 4", title: "Avenger",
        items: [
          {type: "choice", where: "Night - patrol / Decision", minor: true, options: [
            {t: "We'll secure our home turf.", r: "Action / To Miyama", fx: ["Saber +1"]},
            {t: "We'll go to Shinto.", r: "Action / To Shinto"},
          ]},
        ],
      },
      {
        day: "Day 5", title: "Omen",
        items: [
          {type: "choice", where: "School commute ~ School / Ready?", note: "The third option skips the lunch and shopping scenes, and with them Illya's first scenes. Illya Talk would stay at 0.", options: [
            {t: "Consult her about Sakura.", r: "Go! / About Sakura", fx: ["Rin +1"]},
            {t: "Consult her about Shinji.", r: "Go / About Shinji"},
            {t: "I smell danger! Take shelter in my classroom!", r: "No! / Fancy curse. The demon is very angry.", note: "Skips Illya's scenes. Avoid."},
          ]},
          {type: "choice", where: "Shopping district / Daughter of winter ~ Illya (I)", options: [
            {t: "I don't hate you.", r: "Glad to hear that.", fx: ["Illya +1"], pick: true},
            {t: "It doesn't bother me.", r: "An odd reaction"},
          ]},
          {type: "note", text: "The park scene right after this, \"Innocent murder\", adds Illya Talk +1 automatically."},
          {type: "choice", where: "Return home - before dinner / Who will tell Sakura?", options: [
            {t: "Tell Sakura myself.", r: "Action / Myself", fx: ["Sakura +2"], pick: true},
            {t: "Ask Fuji-nee for help.", r: "Request / Fuji-nee"},
          ]},
          {type: "choice", where: "After dinner / Go check on Sakura?", options: [
            {t: "Should I go check on Sakura...?", r: "Dressing room / Cold medicine, capsule A", fx: ["Sakura +2"], pick: true},
            {t: "...No, I'll let Fuji-nee handle it.", r: "Living room / Cold medicine, capsule C"},
          ]},
        ],
      },
      {
        day: "Day 6", title: "Beautiful (I)",
        items: [
          {type: "choice", where: "Nurse Sakura / Naive question", minor: true, options: [
            {t: "I won't lie.", r: "Cold smile"},
            {t: "I'll play it off somehow.", r: "Bitter Sakura"},
          ]},
          {type: "choice", where: "After lunch / Decision", note: "Going out shopping continues Illya's scenes. If Illya Talk = 1 you get Winter castle (II) and Illya Talk becomes 2, which unlocks Day 7's encounter.", options: [
            {t: "I'll go out shopping.", r: "Park / Winter castle (II), if Illya Talk = 1", fx: ["Illya Talk +1"], pick: true},
            {t: "I'll have a snack.", r: "Saber's merciless!", fx: ["Sakura +1"]},
            {t: "I'll relax in front of the TV.", r: "Tranquil times after lunch"},
          ]},
          {type: "choice", where: "Evening / Shinji Matou", minor: true, options: [
            {t: "Punch Shinji.", r: "Action / Outburst"},
            {t: "Bear with it.", r: "Action / Restraint"},
          ]},
          {type: "choice", where: "Sakura collapsed ~ Tonight's plan", note: "The big Sakura jump. You cannot reach the Day 7 and Day 13 thresholds without it.", options: [
            {t: "...No, I'm worried for Sakura.", r: "Night ~ Sleep / Sakura Matou (III)", fx: ["Sakura +5"], pick: true},
            {t: "Patrol Shinto.", r: "Night - patrol / Shinto"},
            {t: "Patrol Miyama.", r: "Night - patrol / Miyama"},
          ]},
        ],
      },
      {
        day: "Day 7", title: "Dialogue lost loop",
        items: [
          {type: "check", where: "Interlude / Renewed contract", cond: "Illya Talk = 2", yes: "Way home - intersection / Encounter: a choice appears", no: "Afternoon / The way home, no Illya scene"},
          {type: "choice", where: "Way home - intersection / Encounter", options: [
            {t: "Invite her over as a guest.", r: "Homesick / Illya (III)", fx: ["Illya Visit = 1", "Illya +3"], pick: true},
            {t: "Do what she wants to make it up to her.", r: "Cinema / Illya (III)", fx: ["Illya +3"], pick: true},
            {t: "Convince her to let it slide.", r: "Decision / Mistake", note: "No Illya points."},
          ]},
          {type: "check", where: "Late night - park / War balance randomizer", cond: "Sakura < 9", yes: "Deep sea: Tiger Dojo 25", no: "Survival ~ Return home / Rift between the two", bad: B(25, "Deep sea"), note: "You need at least 9 Sakura points."},
        ],
      },
      {
        day: "Day 8", title: "De:light",
        items: [
          {type: "check", where: "Rooftop / Rin's advice", cond: "Illya < 3", yes: "Return home ~ Emiya house / Battle for the Holy Grail: Tiger Dojo 26", no: "Leaving school / Twilight town", bad: B(26, "Battle for the Holy Grail"), note: "You need at least 3 Illya points."},
          {type: "choice", where: "Night patrol / Decision", minor: true, options: [
            {t: "Investigate Ryudou Temple.", r: "Choice / Ryudou Temple"},
            {t: "Investigate the park.", r: "Choice / Scolding"},
          ]},
          {type: "choice", where: "Ryudou Temple shrine / Battle of Ryudou Temple", options: [
            {t: "Trust Saber and wait!", r: "Choice / Tragic trust", pick: true},
            {t: "Use a Command Spell!", r: "Choice / Use a Command Spell", pick: true},
            {t: "Cut Zouken down!", r: "Die together", bad: B(27, "Die together")},
          ]},
        ],
      },
      {
        day: "Day 9", title: "Rain",
        items: [
          {type: "choice", where: "School ~ Rooftop / Reporting to Rin", options: [
            {t: "Because he didn't want to kill me?", r: "Correct", fx: ["Rin +1"]},
            {t: "Because the old man was confident?", r: "Correct", fx: ["Rin +1"]},
            {t: "Because he was on guard for my counterattack?", r: "Dissatisfied"},
          ]},
          {type: "choice", where: "Rin's question / Next steps", options: [
            {t: "I can't do this alone. I need Tohsaka's help.", r: "Rin's question / Decision", pick: true},
            {t: "...No, this is my own problem.", r: "Afternoon ~ Showdown / The tragedy of fighting alone", bad: B(28, "The tragedy of fighting alone")},
          ]},
          {type: "choice", where: "Rin's question / Decision", minor: true, options: [
            {t: "Yes", r: "Continues", fx: ["Rin +1"]},
            {t: "No", r: "Reply / Who do you think you are?"},
          ]},
          {type: "choice", where: "Rin's Q&A / Can I trust you not to betray me?", minor: true, options: [
            {t: "Yes", r: "Continues"},
            {t: "No", r: "Reply / Who do you think you are?", fx: ["Rin +1"]},
          ]},
          {type: "choice", where: "Rin's Q&A / Absolute obedience?", options: [
            {t: "Like hell I will!", r: "Reply / Let me win.", pick: true},
            {t: "...I have no choice.", r: "Reply / Geass", fx: ["Geas = 1"], note: "Geas = 1 leads to Tiger Dojo 31 on this day."},
          ]},
          {type: "choice", where: "Rin's bedroom ~ Evening / Decision.", note: "Only offered if Geas is not 1.", options: [
            {t: "I can't leave Sakura alone any longer.", r: "Determination / Rin's angry", fx: ["Sakura +1"], pick: true},
            {t: "I could stay a little longer. There's a caretaker at home.", r: "Determination / Rin's definitely angry"},
          ]},
          {type: "choice", where: "VS Rider / The truth about Sakura", options: [
            {t: "I pull Tohsaka back.", r: "Unsealing Mystic Eyes / Help Rin", fx: ["Rin +1", "Sakura +1"], pick: true},
            {t: "There's nothing I can do.", r: "Unsealing Mystic Eyes / Direct hit"},
            {t: "I close my eyes and attack Rider.", r: "VS Rider / Stone coffin", bad: B(29, "Stone coffin")},
          ]},
          {type: "choice", where: "Outside the church ~ Park - night / What I should protect", options: [
            {t: "I want to be on Sakura's side.", r: "Park ~ To the church / Running through the rain", pick: true},
            {t: "...I'll keep doing the right thing.", r: "Hero of justice", bad: B(30, "Hero of justice")},
          ]},
          {type: "check", where: "Church - confronting Rin / Set position", cond: "Geas = 1", yes: "Night - church / Geass: Tiger Dojo 31", no: "Rain, the story continues", bad: B(31, "Geass")},
        ],
      },
      {
        day: "Day 10", title: "Darkwood, sleeping beauty",
        items: [
          {type: "choice", where: "Breakfast / Rider at the dining table", options: [
            {t: "I'm fond of her.", r: "Impressions / Sakura, red card to Rider", fx: ["Sakura +1"], pick: true},
            {t: "More important, aren't you going to eat, Rider?", r: "Rider, breakfast? / I won't eat", fx: ["Sakura +1"], pick: true},
            {t: "I can't deal with her.", r: "Impressions / Rider steams"},
          ]},
          {type: "choice", where: "Einzbern Forest / Rendezvous with Rin", options: [
            {t: "I should hurry and see what's going on.", r: "Einzbern Forest / To the blast site", pick: true},
            {t: "...I should stay here.", r: "Cursed Womb / Realm Mandala", bad: B(32, "Cursed Womb / Realm Mandala")},
          ]},
          {type: "choice", where: "Einzbern Forest / Distraction", options: [
            {t: "Protect Illya...!", r: "Blood out", pick: true},
            {t: "Bring Tohsaka back...!", r: "World purge meltdown", bad: B(33, "World purge meltdown")},
          ]},
          {type: "choice", where: "Leaving the church / Who's my master?", options: [
            {t: "Illya, I guess?", r: "Impressions / Illya's happy", fx: ["Illya +1"], pick: true},
            {t: "Tohsaka, I guess?", r: "Impressions / Rin's red-faced", fx: ["Rin +1"]},
          ]},
          {type: "choice", where: "Sleep / Decision.", minor: true, options: [
            {t: "Release it.", r: "Choice: Release it"},
            {t: "Do not release it.", r: "Choice: Do not release it."},
          ]},
        ],
      },
      {
        day: "Day 11", title: "Beautiful (II)",
        items: [
          {type: "choice", where: "Afternoon / Decision", options: [
            {t: "Speaking of which, I haven't seen Rider.", r: "Action / Cute girl", fx: ["Sakura +1"], pick: true},
            {t: "No, I should look after Sakura first.", r: "Action / Earnestness", fx: ["Sakura +1"], pick: true},
            {t: "I'll check on Tohsaka and Illya.", r: "Action / Rin and Illya"},
          ]},
        ],
      },
      {
        day: "Day 12", title: "Overdose",
        items: [
          {type: "choice", where: "Morning - dojo / My determination", options: [
            {t: "...I nod.", r: "Determination / Precious fool", pick: true},
            {t: "...No, I can't do it...", r: "Determination / The error of indecision", fx: ["Blame = 1"], note: "Blame = 1 forces Tiger Dojo 35 on Day 13."},
          ]},
        ],
      },
      {
        day: "Day 13", title: "Last talk",
        items: [
          {type: "choice", where: "Morning - my room / Assassin infiltrates", options: [
            {t: "Accept.", r: "~ Matou house / Confronting Zouken", pick: true},
            {t: "Don't accept.", r: "Lunch ~ Dinner / Horror show", bad: B(34, "Horror show")},
          ]},
          {type: "check", where: "Night / Time to decide", cond: "Sakura < 11 OR Blame = 1", yes: "Happy ending: Tiger Dojo 35", no: "A choice appears (below)", bad: B(35, "Happy ending"), note: "You need at least 11 Sakura points and Blame must not be 1."},
          {type: "choice", where: "Night / Time to decide", options: [
            {t: "...I just can't do it.", r: "Night / Beautiful aria", pick: true},
            {t: "Kill her myself.", r: "Happy ending", bad: B(35, "Happy ending")},
          ]},
        ],
      },
      {
        day: "Day 14", title: "Servant eater",
        items: [
          {type: "choice", where: "Matou house - Sakura's room / Decision", options: [
            {t: "Rush home.", r: "Action / Best", fx: ["Illya +1"], pick: true},
            {t: "I can't forgive Zouken.", r: "Action / Worst"},
          ]},
        ],
      },
      {
        day: "Day 15", title: "Limited",
        items: [
          {type: "choice", where: "Finale replay", options: [
            {t: "I'll save Sakura. I'll take Illya back.", r: "Church ~ Outside the church / Continue battle", pick: true},
            {t: "We lose.", r: "Dead fin", bad: B(36, "Dead fin")},
          ]},
          {type: "choice", where: "Church ~ Kotomine's help", options: [
            {t: "Nod.", r: "To the forest / Duo", pick: true},
            {t: "Refuse.", r: "Einzbern Castle / Death penalty", bad: B(37, "Death penalty")},
          ]},
          {type: "choice", where: "Einzbern Castle / Illya found", minor: true, options: [
            {t: "Bring Illya home.", r: "Action / Emotion"},
          ]},
          {type: "choice", where: "Preparing for the final battle / Confrontation with Rider", note: "Only the third choice below avoids Tiger Dojo 38.", options: [
            {t: "Tell her the answer she's waited for.", r: "Decision / Rider's question (a second choice follows)", pick: true},
            {t: "Run out of the shed...!", r: "Night / Rider leaves", bad: B(38, "Sparks Liner High")},
            {t: "Fight back with a Projection...!", r: "Night / Rider leaves", bad: B(38, "Sparks Liner High")},
          ]},
          {type: "choice", where: "Decision / Rider's question", options: [
            {t: "\"Will you be on Sakura's side until the end?\"", r: "Preparing for the final battle / Tactics, then Goodbye and thank you", pick: true},
            {t: "\"Can you fight until the end?\"", r: "Night / Rider leaves", bad: B(38, "Sparks Liner High")},
            {t: "\"Will you never give up until the very end?\"", r: "Night / Rider leaves", bad: B(38, "Sparks Liner High")},
          ]},
        ],
      },
      {
        day: "Final Day", title: "Final",
        items: [
          {type: "choice", where: "VS Saber / Burst", note: "\"Use my next Projection...!\" sets Burst = 1, which forces the Normal End.", options: [
            {t: "Wait for my chance...!", r: "VS Saber / Crazy Train II", pick: true},
            {t: "Use my next Projection...!", r: "VS Saber / Burst, out", fx: ["Burst = 1"]},
            {t: "Clash with Saber...!", r: "Midway cave / Mercy", bad: B(39, "Mercy")},
          ]},
          {type: "choice", where: "Oath", options: [
            {t: "...Bring my arm down.", r: "...I'll forget you", pick: true},
            {t: "...Help Saber.", r: "Cavern / Femme Fatale", bad: B(40, "Femme Fatale")},
          ]},
          {type: "check", where: "Conclusion / To Aṇra Mainiiu", cond: "Illya < 4 OR Burst = 1", yes: "Conclusion / Conclusion: Heaven's Feel / Normal End (Cherry Blossoms' Dream)", no: "Conclusion / All the Evil in the World, toward the True End"},
          {type: "check", where: "Last Projection", cond: "Heaven's Feel True End already cleared", yes: "You get a final choice: \"Do it.\" (Normal End) or \"...Is that really okay?\" (True End)", no: "Conclusion / End of a miracle: Heaven's Feel / True End (Return to the Spring)"},
          {type: "note", text: "Endings: Normal End \"Cherry Blossoms' Dream\" and True End \"Return to the Spring\"."},
        ],
      },
    ],
  },
]
