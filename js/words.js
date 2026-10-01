// Word lists and hand-written reading passages used by the reading item generators.
// Grade labels on skills are estimates until each skill is mapped to an Alberta ELAL outcome.
window.KT = window.KT || {};

KT.words = {
  cvc_a: ['cat', 'bat', 'hat', 'mat', 'rat', 'sat', 'pan', 'can', 'fan', 'man', 'van', 'map', 'cap', 'tap', 'bag', 'rag', 'wag', 'jam', 'ham', 'dad', 'pad', 'sad', 'ran', 'tag'],
  cvc_i: ['pig', 'big', 'dig', 'wig', 'fig', 'sit', 'hit', 'pit', 'bit', 'fin', 'pin', 'win', 'tin', 'lip', 'hip', 'dip', 'zip', 'rip', 'kid', 'lid', 'bib', 'mix', 'six'],
  cvc_o: ['dog', 'log', 'fog', 'hog', 'hot', 'pot', 'dot', 'cot', 'not', 'top', 'mop', 'hop', 'pop', 'box', 'fox', 'rod', 'nod', 'cob', 'job', 'mom'],
  cvc_u: ['bug', 'hug', 'mug', 'rug', 'jug', 'tug', 'bun', 'fun', 'run', 'sun', 'cup', 'pup', 'cut', 'hut', 'nut', 'bus', 'tub', 'cub', 'mud', 'bud', 'gum', 'hum'],
  cvc_e: ['bed', 'red', 'fed', 'led', 'wed', 'hen', 'pen', 'ten', 'den', 'men', 'net', 'pet', 'wet', 'jet', 'get', 'leg', 'peg', 'beg', 'web', 'yes', 'vet'],
  hf1: ['the', 'is', 'to', 'and', 'see', 'we', 'my', 'you', 'it', 'in', 'can', 'go', 'like', 'me', 'he', 'she'],
  hf2: ['was', 'said', 'are', 'they', 'have', 'of', 'what', 'there', 'do', 'one', 'where', 'come', 'some', 'who', 'here', 'for'],
  hf3: ['because', 'could', 'would', 'should', 'again', 'friend', 'people', 'water', 'write', 'know', 'very', 'every', 'after', 'before', 'many'],
  digraph: ['ship', 'shop', 'fish', 'dish', 'wish', 'shut', 'chip', 'chin', 'chop', 'much', 'rich', 'lunch', 'thin', 'this', 'that', 'then', 'bath', 'math', 'with', 'when', 'whip', 'duck', 'sock', 'back', 'kick', 'neck', 'lock'],
  blend_init: ['stop', 'step', 'spin', 'spot', 'flag', 'flat', 'frog', 'from', 'trip', 'trap', 'drum', 'drip', 'clap', 'clip', 'crab', 'grab', 'glad', 'plan', 'plum', 'snap', 'swim', 'slip', 'brick', 'black', 'skip'],
  blend_final: ['hand', 'sand', 'band', 'pond', 'bend', 'nest', 'best', 'vest', 'fast', 'last', 'jump', 'lamp', 'camp', 'bump', 'milk', 'belt', 'gift', 'soft', 'tent', 'went', 'desk', 'mask'],
  vce: ['cake', 'lake', 'make', 'game', 'name', 'gate', 'bike', 'kite', 'time', 'like', 'hide', 'nine', 'home', 'bone', 'rope', 'nose', 'note', 'cute', 'tube', 'mule', 'huge', 'ride', 'five', 'tape'],
  vt_ee: ['see', 'tree', 'bee', 'feet', 'seed', 'keep', 'green', 'sleep', 'sheep', 'eat', 'sea', 'read', 'team', 'beach', 'leaf', 'bean', 'meat', 'seat'],
  vt_ai: ['rain', 'tail', 'mail', 'train', 'paint', 'wait', 'snail', 'day', 'play', 'say', 'way', 'tray', 'stay', 'gray'],
  vt_oa: ['boat', 'coat', 'goat', 'road', 'soap', 'toast', 'float', 'snow', 'grow', 'slow', 'show', 'bow', 'yellow', 'window'],
  rc: ['car', 'star', 'park', 'farm', 'barn', 'corn', 'fork', 'horse', 'storm', 'short', 'her', 'fern', 'bird', 'girl', 'shirt', 'first', 'turn', 'hurt', 'burn', 'nurse'],
  infl: ['cats', 'dogs', 'jumps', 'jumped', 'jumping', 'played', 'playing', 'helps', 'helped', 'looked', 'looking', 'wished', 'fishing', 'runs', 'sitting', 'hopped'],
  syl2: ['sunset', 'cupcake', 'hotdog', 'bathtub', 'napkin', 'rabbit', 'kitten', 'picnic', 'basket', 'muffin', 'pocket', 'magnet', 'dentist', 'insect', 'button', 'lemon', 'robot', 'tiger', 'pencil', 'happy']
};

// First-sound pictures: [letter, word, emoji]
KT.firstSounds = {
  cons: [['b', 'ball', '🏀'], ['c', 'cat', '🐱'], ['d', 'dog', '🐶'], ['f', 'fish', '🐟'], ['g', 'goat', '🐐'], ['h', 'hat', '🎩'], ['j', 'juice', '🧃'], ['k', 'kite', '🪁'], ['l', 'lion', '🦁'], ['m', 'moon', '🌙'], ['n', 'nose', '👃'], ['p', 'pig', '🐷'], ['r', 'rabbit', '🐰'], ['s', 'sun', '☀️'], ['t', 'tree', '🌳'], ['v', 'van', '🚐'], ['w', 'web', '🕸️'], ['y', 'yo-yo', '🪀'], ['z', 'zebra', '🦓']],
  vowel: [['a', 'apple', '🍎'], ['e', 'egg', '🥚'], ['i', 'insect', '🐛'], ['o', 'octopus', '🐙'], ['u', 'umbrella', '☂️']]
};

// Reading passages: the child reads `text` (it is never read aloud); the question is spoken.
KT.passages = {
  sent1: [
    { text: 'The cat sat on a mat.', q: 'Where did the cat sit?', a: 'on a mat', d: ['in a box', 'on a bed'] },
    { text: 'A big dog ran to the van.', q: 'Where did the dog run?', a: 'to the van', d: ['to the bus', 'to the hut'] },
    { text: 'The pig is in the mud.', q: 'Where is the pig?', a: 'in the mud', d: ['in the sun', 'on a log'] },
    { text: 'Mom has a red hat.', q: 'What does Mom have?', a: 'a red hat', d: ['a red cup', 'a big bag'] },
    { text: 'The bug is on the rug.', q: 'Where is the bug?', a: 'on the rug', d: ['in the cup', 'on the bed'] },
    { text: 'I can see a fox in a box.', q: 'What is in the box?', a: 'a fox', d: ['a dog', 'a hen'] },
    { text: 'Ten men sat in a hut.', q: 'How many men sat in the hut?', a: 'ten', d: ['six', 'one'] },
    { text: 'The sun is hot.', q: 'What is hot?', a: 'the sun', d: ['the mud', 'the pot'] },
    { text: 'Dad can fix the van.', q: 'Who can fix the van?', a: 'Dad', d: ['Mom', 'the kid'] },
    { text: 'A hen is in a pen.', q: 'Where is the hen?', a: 'in a pen', d: ['on a bus', 'in a cup'] }
  ],
  sent2: [
    { text: 'The frog can jump on the log.', q: 'What can the frog do?', a: 'jump', d: ['swim', 'sing'] },
    { text: 'She has a fish in a dish.', q: 'Where is the fish?', a: 'in a dish', d: ['in a ship', 'in the pond'] },
    { text: 'They went to the pond to swim.', q: 'Why did they go to the pond?', a: 'to swim', d: ['to shop', 'to eat lunch'] },
    { text: 'The black duck is in the pond.', q: 'What color is the duck?', a: 'black', d: ['red', 'green'] },
    { text: 'We had lunch with Dad at the park.', q: 'Who did they have lunch with?', a: 'Dad', d: ['Mom', 'a friend'] },
    { text: 'Chad has a red sled. He slid down the hill.', q: 'What does Chad have?', a: 'a red sled', d: ['a red sock', 'a black hat'] },
    { text: 'I will get a gift for my friend.', q: 'Who is the gift for?', a: 'my friend', d: ['my mom', 'my dog'] },
    { text: 'Six ducks swim in the pond. Then they rest.', q: 'What do the ducks do after they swim?', a: 'rest', d: ['eat', 'run'] }
  ],
  story1: [
    { text: 'Sam has a pup. The pup is named Max. Max likes to dig in the sand. Sam and Max play all day.', q: 'What is the pup\'s name?', a: 'Max', d: ['Sam', 'Ted'] },
    { text: 'Sam has a pup. The pup is named Max. Max likes to dig in the sand. Sam and Max play all day.', q: 'What does Max like to do?', a: 'dig in the sand', d: ['swim in the pond', 'sleep in a box'] },
    { text: 'It is a hot day. Jen and Ben go to the lake. They swim and splash. Then they eat a snack.', q: 'Where do Jen and Ben go?', a: 'the lake', d: ['the shop', 'the park'] },
    { text: 'It is a hot day. Jen and Ben go to the lake. They swim and splash. Then they eat a snack.', q: 'What do they do last?', a: 'eat a snack', d: ['swim', 'go to bed'] },
    { text: 'Kate has a kite. The wind is strong. The kite goes up, up, up! Kate holds the string tight.', q: 'Why does the kite go up?', a: 'the wind is strong', d: ['Kate jumps', 'it is wet'] },
    { text: 'Kate has a kite. The wind is strong. The kite goes up, up, up! Kate holds the string tight.', q: 'What does Kate hold?', a: 'the string', d: ['the hat', 'the cake'] }
  ],
  story2: [
    { text: 'Ben put on his coat and hat. He got his sled. Snow fell on the trees.', q: 'What season is it?', a: 'winter', d: ['summer', 'spring'] },
    { text: 'Mia looked in her lunch box. It was empty! Her tummy made a big sound.', q: 'How does Mia feel?', a: 'hungry', d: ['sleepy', 'cold'] },
    { text: 'The dog wagged its tail and ran to the door. A car stopped outside.', q: 'Who do you think is at the door?', a: 'someone the dog likes', d: ['a big storm', 'a lost fish'] },
    { text: 'Leo had a green seed. He put it in dirt and gave it water every day. Soon he saw a little stem.', q: 'What is happening to the seed?', a: 'it is growing', d: ['it is melting', 'it is lost'] }
  ]
};
