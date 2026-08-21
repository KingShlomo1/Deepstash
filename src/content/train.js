/* Workouts (interval timer) and breathing/meditation sessions. */

export const WORKOUTS=[
 {id:"w1",cat:"HIIT",title:"Express Fat-Burn HIIT",level:"All levels",rounds:3,ex:[["Jumping jacks",40,"Light on your feet, full arm range."],["Rest",20,""],["High knees",40,"Drive knees to hip height."],["Rest",20,""],["Squat to jump",40,"Sit back, explode up, land soft."],["Rest",20,""],["Mountain climbers",40,"Hips low, knees fast, core braced."],["Rest",30,""]]},
 {id:"w2",cat:"Core",title:"6-Minute Ab Finisher",level:"Beginner+",rounds:2,ex:[["Crunches",40,"Ribs toward hips, slow."],["Rest",15,""],["Bicycle kicks",40,"Opposite elbow to knee."],["Rest",15,""],["Plank hold",45,"Straight line, squeeze glutes."],["Rest",15,""],["Leg raises",40,"Press low back down."],["Rest",20,""]]},
 {id:"w3",cat:"Strength",title:"Full-Body Strength",level:"Intermediate",rounds:3,ex:[["Push-ups",40,"Elbows ~45°, full depth."],["Rest",20,""],["Reverse lunges",45,"Front knee over ankle."],["Rest",20,""],["Pike push-ups",35,"Hips high, crown to floor."],["Rest",20,""],["Glute bridge",40,"Drive heels, pause at top."],["Rest",30,""]]},
 {id:"w4",cat:"Mobility",title:"Daily Mobility Flow",level:"All levels",rounds:1,ex:[["Neck rolls",30,"Slow circles both ways."],["Shoulder circles",30,"Big backward, then forward."],["Cat–cow",45,"Flow with the breath."],["Hip openers",45,"Breathe into the hip."],["Thoracic twists",40,"Rotate from mid-back."],["World's greatest stretch",50,"Lunge, elbow down, reach up."]]},
];

export const SESSIONS=[
 {id:"s1",cat:"Mind",title:"Box Breathing",level:"2 min · calm",kind:"breathe",pattern:[4,4,4,4],cycles:8,desc:"The SEAL reset. In 4, hold 4, out 4, hold 4."},
 {id:"s2",cat:"Mind",title:"Calm Breath (4-7-8)",level:"~3 min · sleep",kind:"breathe",pattern:[4,7,8,0],cycles:6,desc:"Inhale 4, hold 7, exhale 8. Slows a racing mind."},
 {id:"s3",cat:"Mind",title:"5-Minute Meditation",level:"5 min · focus",kind:"meditate",secs:300,desc:"Sit. Follow the breath. When you drift, return. That's the rep."},
];
