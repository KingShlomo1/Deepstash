/* Knowledge maps: root -> branches -> points. */

export const MAPS=[
 {id:"mp1",topic:"discipline",root:"The Habit Loop",emoji:"🔁",sub:"How every habit is built — and rebuilt",branches:[
   {l:"Cue",e:"🔔",pts:["The trigger that starts it","Make it obvious","Design your environment"]},
   {l:"Craving",e:"🧲",pts:["The wanting / motivation","Make it attractive","Bundle it with something fun"]},
   {l:"Response",e:"⚡",pts:["The action itself","Make it easy","Two-minute rule · reduce friction"]},
   {l:"Reward",e:"🏆",pts:["Closes the loop","Make it satisfying","Track it · celebrate the rep"]},
 ]},
 {id:"mp2",topic:"money",root:"Personal Finance",emoji:"💰",sub:"The four moves that build wealth",branches:[
   {l:"Earn",e:"💼",pts:["Grow skills → grow income","Build multiple streams","Negotiate your worth"]},
   {l:"Save",e:"🏦",pts:["Pay yourself first","Emergency fund (3–6 months)","Automate every transfer"]},
   {l:"Invest",e:"📈",pts:["Broad, low-cost index funds","Time in the market","Let compounding cook"]},
   {l:"Protect",e:"🛡️",pts:["Insure the big risks","Avoid bad (consumer) debt","Diversify · don't panic-sell"]},
 ]},
 {id:"mp3",topic:"fit",root:"Fitness Foundations",emoji:"💪",sub:"Get strong and stay consistent",branches:[
   {l:"Train",e:"🏋️",pts:["Squat · hinge · push","Pull · carry","Progressive overload weekly"]},
   {l:"Fuel",e:"🍳",pts:["Protein ~0.7g per lb","Mostly whole foods","Hydrate before caffeine"]},
   {l:"Recover",e:"😴",pts:["7–9 hours of sleep","Rest & deload weeks","Manage stress"]},
   {l:"Consistency",e:"🔁",pts:["Don't miss twice","Show up ugly at 70%","Track progress"]},
 ]},
 {id:"mp4",topic:"mind",root:"The Calm Toolkit",emoji:"🧘",sub:"Reset your nervous system, fast",branches:[
   {l:"Breath",e:"🌬️",pts:["Box breathing 4-4-4-4","Long exhales (4-7-8)","Slow it to slow the mind"]},
   {l:"Body",e:"🖐️",pts:["5-4-3-2-1 senses","Relax the shoulders & jaw","Walk it off"]},
   {l:"Mind",e:"💭",pts:["Name the emotion","Watch it, don't fight it","This will pass"]},
   {l:"Habit",e:"🙏",pts:["Daily gratitude","Protect your mornings","Screen curfew at night"]},
 ]},
 {id:"mp5",topic:"learn",root:"Learn Anything",emoji:"📚",sub:"The science of durable learning",branches:[
   {l:"Recall",e:"🔍",pts:["Test, don't reread","Struggle strengthens memory","Flashcards / self-quiz"]},
   {l:"Space",e:"📅",pts:["Review across days","Right before you forget","Sleep between sessions"]},
   {l:"Teach",e:"🧑‍🏫",pts:["Explain it simply","Jargon hides gaps","The Feynman technique"]},
   {l:"Connect",e:"🕸️",pts:["Interleave topics","Tie new to known","Memory is a web"]},
 ]},
 {id:"mp6",topic:"phil",root:"Stoic Operating System",emoji:"🏛️",sub:"Stay calm, useful, and free",branches:[
   {l:"Control",e:"🎯",pts:["Sort: yours vs not-yours","Pour energy into the first","Release the rest"]},
   {l:"Prepare",e:"🌅",pts:["Rehearse friction at dawn","Negative visualization","Nothing can ambush you"]},
   {l:"Act",e:"⚙️",pts:["Virtue is the only good","Do the right thing now","The obstacle is the way"]},
   {l:"Reflect",e:"📓",pts:["Journal each night","What went well / poorly","Memento mori"]},
 ]},
 {id:"mp7",topic:"health",root:"Sleep Better Tonight",emoji:"😴",sub:"The pillars of deep, restorative sleep",branches:[
   {l:"Light",e:"☀️",pts:["Morning sun in your eyes","Dim screens after sunset","Dark, cool bedroom"]},
   {l:"Timing",e:"⏰",pts:["Consistent sleep/wake","No caffeine after 2pm","Last meal 2–3h before bed"]},
   {l:"Wind-down",e:"🛁",pts:["Screen curfew","Warm shower → cool body","Read, don't scroll"]},
   {l:"Environment",e:"🌙",pts:["Cool (~18°C)","Quiet & dark","Bed = sleep only"]},
 ]},
 {id:"mp8",topic:"genius",root:"Deep Work",emoji:"🎯",sub:"Produce your best, focused work",branches:[
   {l:"Protect",e:"🛡️",pts:["Block distraction-free time","Phone in another room","Single-task on purpose"]},
   {l:"Ritual",e:"🔁",pts:["Same time & place","A start cue","Define 'done'"]},
   {l:"Rest",e:"🌿",pts:["Take real breaks","Walk to think","Sleep consolidates"]},
   {l:"Measure",e:"📊",pts:["Track deep hours","Shrink shallow work","Review weekly"]},
 ]},
 {id:"mp9",topic:"astro",root:"The Solar System",emoji:"🪐",sub:"Our cosmic neighborhood at a glance",branches:[
   {l:"The Sun",e:"☀️",pts:["99.8% of all the mass","Fuses hydrogen → helium","Light takes 8 min to reach us"]},
   {l:"Rocky planets",e:"🪨",pts:["Mercury · Venus · Earth · Mars","Small, dense, solid","Earth: the only known life"]},
   {l:"Gas giants",e:"🌪️",pts:["Jupiter · Saturn","Huge, stormy, ringed","Saturn floats in water"]},
   {l:"Ice & edges",e:"❄️",pts:["Uranus · Neptune","Kuiper Belt & Pluto","Oort Cloud far beyond"]},
 ]},
 {id:"mp10",topic:"history",root:"Eras of History",emoji:"🏺",sub:"The big chapters of the human story",branches:[
   {l:"Ancient",e:"🏛️",pts:["First cities & writing","Egypt · Greece · Rome","Foundations of law & math"]},
   {l:"Medieval",e:"🏰",pts:["Empires rise & fall","Trade routes connect worlds","Universities begin"]},
   {l:"Early modern",e:"⛵",pts:["Exploration & printing","Scientific revolution","Global exchange"]},
   {l:"Modern",e:"⚙️",pts:["Industry & electricity","Information age","Accelerating change"]},
 ]},
 {id:"mp11",topic:"bio",root:"The Human Body",emoji:"🧬",sub:"Systems that keep you alive",branches:[
   {l:"Power",e:"🫀",pts:["Heart pumps ~100k times/day","Blood carries oxygen","Lungs trade gases"]},
   {l:"Control",e:"🧠",pts:["Brain & nerves","Hormones as messengers","Gut has its own 'brain'"]},
   {l:"Defense",e:"🛡️",pts:["Immune system","Skin as a barrier","Fever fights invaders"]},
   {l:"Renewal",e:"🔁",pts:["~330B cells replaced daily","Sleep repairs & files","Food becomes you"]},
 ]},
];
