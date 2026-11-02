// Word library for Gartic Sounds starting words. Every entry is one or two words, never a sentence.
// Kept on the server so the full list is never sent to players (samples only, see /api/words/library).
const seen = new Set();
// A word lives in exactly one pack, so the "mixed" library never repeats an entry.
const pack = (id, name, blurb, icon, csv) => ({
  id,
  name,
  blurb,
  icon,
  words: csv
    .split(",")
    .map((w) => w.trim())
    .filter((w) => {
      const key = w.toLowerCase();
      if (!w || seen.has(key)) return false;
      seen.add(key);
      return true;
    }),
});

export const WORD_PACKS = [
  pack(
    "animals",
    "Animals",
    "Wild, tame and slightly ridiculous.",
    "paw",
    `Lion,Tiger,Elephant,Giraffe,Zebra,Hippo,Rhino,Cheetah,Leopard,Panther,Jaguar,Gorilla,Chimpanzee,Orangutan,Baboon,Monkey,Lemur,Sloth,Koala,Kangaroo,Wallaby,Platypus,Wombat,Tasmanian Devil,Panda,Red Panda,Polar Bear,Grizzly Bear,Brown Bear,Wolf,Fox,Coyote,Hyena,Jackal,Meerkat,Mongoose,Otter,Beaver,Badger,Raccoon,Skunk,Porcupine,Hedgehog,Armadillo,Anteater,Squirrel,Chipmunk,Hamster,Guinea Pig,Rabbit,Hare,Mouse,Rat,Bat,Dog,Puppy,Cat,Kitten,Horse,Pony,Donkey,Mule,Camel,Llama,Alpaca,Cow,Bull,Buffalo,Yak,Goat,Sheep,Pig,Boar,Deer,Moose,Reindeer,Antelope,Bison,Dolphin,Whale,Blue Whale,Orca,Shark,Great White,Stingray,Octopus,Squid,Jellyfish,Seahorse,Starfish,Crab,Lobster,Shrimp,Turtle,Tortoise,Crocodile,Alligator,Lizard,Chameleon,Gecko,Iguana,Komodo Dragon,Snake,Cobra,Python,Frog,Toad,Salamander,Eagle,Hawk,Falcon,Owl,Parrot,Peacock,Penguin,Flamingo,Pelican,Toucan,Hummingbird,Woodpecker,Crow,Pigeon,Sparrow,Swan,Duck,Goose,Chicken,Rooster,Turkey,Ostrich,Emu,Kiwi,Vulture,Seagull,Butterfly,Bee,Wasp,Ant,Spider,Scorpion,Mosquito,Ladybug,Dragonfly,Cricket,Firefly,Snail,Earthworm,Goldfish,Clownfish,Piranha,Salmon,Pufferfish`,
  ),
  pack(
    "people",
    "Famous people",
    "Legends, icons and household names.",
    "star",
    `Albert Einstein,Isaac Newton,Marie Curie,Nikola Tesla,Stephen Hawking,Charles Darwin,Galileo,Da Vinci,Michelangelo,Pablo Picasso,Van Gogh,Frida Kahlo,William Shakespeare,Mark Twain,Charles Dickens,Agatha Christie,Beethoven,Mozart,Bach,Freddie Mercury,Elvis Presley,Michael Jackson,John Lennon,Bob Marley,Taylor Swift,Beyonce,Rihanna,Ed Sheeran,Adele,Lady Gaga,Katy Perry,Justin Bieber,Eminem,Shakira,Charlie Chaplin,Marilyn Monroe,Audrey Hepburn,Bruce Lee,Jackie Chan,Tom Hanks,Leonardo DiCaprio,Brad Pitt,Johnny Depp,Will Smith,Morgan Freeman,Robin Williams,Oprah Winfrey,Walt Disney,Steve Jobs,Bill Gates,Elon Musk,Mark Zuckerberg,Jeff Bezos,Henry Ford,Thomas Edison,Wright Brothers,Neil Armstrong,Yuri Gagarin,Buzz Aldrin,Kalpana Chawla,Abdul Kalam,Mahatma Gandhi,Nelson Mandela,MLK,Abraham Lincoln,George Washington,Winston Churchill,Napoleon,Julius Caesar,Cleopatra,Alexander,Genghis Khan,Anne Frank,Queen Victoria,Queen Elizabeth,Mother Teresa,Swami Vivekananda,Rabindranath Tagore,Chanakya,Emperor Akbar,Shivaji,Rani Laxmibai,Ashoka,Lionel Messi,Cristiano Ronaldo,Pele,Maradona,Neymar,Usain Bolt,Muhammad Ali,Mike Tyson,Michael Jordan,LeBron James,Serena Williams,Roger Federer,Rafael Nadal,Tiger Woods,Michael Phelps,Sachin Tendulkar,Virat Kohli,MS Dhoni,Kapil Dev,PV Sindhu,Neeraj Chopra,Mary Kom,Shahrukh Khan,Amitabh Bachchan,Salman Khan,Aamir Khan,Priyanka Chopra,Deepika Padukone,Lata Mangeshkar,Kishore Kumar,AR Rahman,Rajinikanth,Charlie Puth,Greta Thunberg,Malala,Gordon Ramsay,Mr Bean,Bear Grylls,David Attenborough`,
  ),
  pack(
    "characters",
    "Characters & legends",
    "Cartoons, superheroes, gods and myths.",
    "mask",
    `Mickey Mouse,Donald Duck,Bugs Bunny,Jerry Mouse,Scooby Doo,SpongeBob,Homer Simpson,Peppa Pig,Winnie Pooh,Doraemon,Shinchan,Chhota Bheem,Motu Patlu,Pikachu,Mario,Luigi,Sonic,Pac-Man,Donkey Kong,Link,Kirby,Batman,Superman,Spider-Man,Iron Man,Captain America,Thor,Hulk,Black Panther,Wonder Woman,Aquaman,Flash,Joker,Thanos,Loki,Darth Vader,Yoda,Chewbacca,Han Solo,R2-D2,Harry Potter,Dumbledore,Hermione,Gandalf,Frodo,Gollum,Shrek,Donkey,Elsa,Olaf,Simba,Mufasa,Nemo,Dory,Woody,Buzz Lightyear,Aladdin,Genie,Cinderella,Snow White,Sherlock Holmes,James Bond,Indiana Jones,Robin Hood,Peter Pan,Tinker Bell,Captain Hook,Pinocchio,Dracula,Frankenstein,Mummy,Werewolf,Zombie,Vampire,Ghost,Witch,Zeus,Poseidon,Hades,Athena,Apollo,Hercules,Medusa,Odin,Anubis,Ra,Hanuman,Ganesha,Krishna,Arjuna,Karna,Bheem,Ravana,Santa Claus,Easter Bunny,Tooth Fairy,Genie,Superman,Scrat,Gru,Minion,Po,Tintin,Asterix,Popeye,Garfield,Snoopy,Charlie Brown,Pink Panther,Road Runner,Wile Coyote,Daffy Duck,Porky Pig,Tweety,Sylvester`,
  ),
  pack(
    "food",
    "Food & drink",
    "Snacks, feasts and things in a mug.",
    "utensils",
    `Pizza,Burger,Hot Dog,Sandwich,Taco,Burrito,Nachos,Pasta,Spaghetti,Lasagna,Ramen,Sushi,Dumpling,Noodles,Fried Rice,Biryani,Samosa,Pakora,Pani Puri,Vada Pav,Dosa,Idli,Paneer,Butter Chicken,Naan,Roti,Paratha,Chole Bhature,Dal,Rajma,Khichdi,Jalebi,Gulab Jamun,Rasgulla,Ladoo,Kheer,Halwa,Kulfi,Lassi,Masala Chai,Coffee,Espresso,Latte,Cappuccino,Green Tea,Hot Chocolate,Milkshake,Smoothie,Lemonade,Soda,Orange Juice,Coconut Water,Popcorn,Chips,French Fries,Pretzel,Cookie,Brownie,Cupcake,Donut,Pancake,Waffle,Croissant,Bagel,Toast,Cereal,Omelette,Boiled Egg,Bacon,Sausage,Steak,Fried Chicken,Drumstick,Meatball,Salad,Soup,Curry,Cheese,Butter,Yogurt,Ice Cream,Chocolate,Candy,Lollipop,Chewing Gum,Cotton Candy,Marshmallow,Honey,Jam,Peanut Butter,Ketchup,Mustard,Chilli,Garlic,Onion,Potato,Tomato,Carrot,Broccoli,Corn,Mushroom,Pumpkin,Cucumber,Apple,Banana,Mango,Orange,Grapes,Watermelon,Pineapple,Strawberry,Cherry,Lemon,Coconut,Papaya,Kiwi Fruit,Avocado,Pomegranate`,
  ),
  pack(
    "places",
    "Places & landmarks",
    "Cities, wonders and far-off corners.",
    "pin",
    `Eiffel Tower,Taj Mahal,Great Wall,Lady Liberty,Big Ben,Colosseum,Pyramids,Sphinx,Machu Picchu,Stonehenge,Leaning Tower,Opera House,Golden Gate,Mount Everest,Niagara Falls,Grand Canyon,Amazon Jungle,Sahara Desert,North Pole,South Pole,Barrier Reef,Dead Sea,Antarctica,Himalayas,Mount Fuji,Red Fort,India Gate,Marine Drive,Qutub Minar,Golden Temple,Hawa Mahal,Charminar,Ganges,Kerala,Goa,Rajasthan,Kashmir,Mumbai,Delhi,Kolkata,Chennai,Bangalore,Hyderabad,Jaipur,Varanasi,Agra,Shimla,Paris,London,Rome,Venice,Tokyo,Kyoto,Beijing,Hong Kong,Singapore,Dubai,Cairo,New York,Las Vegas,Hollywood,Rio,Mexico,Canada,Brazil,Egypt,Japan,China,Italy,France,Greece,Iceland,Australia,Switzerland,Thailand,Maldives,Hawaii,Bermuda Triangle,Atlantis,Moon,Mars,Airport,Train Station,Hospital,School,Library,Museum,Zoo,Aquarium,Circus,Casino,Cinema,Stadium,Bakery,Market,Supermarket,Beach,Island,Volcano,Cave,Waterfall,Jungle,Farm,Castle,Palace,Temple,Lighthouse,Bridge`,
  ),
  pack(
    "objects",
    "Things around the house",
    "Gadgets, gear and junk-drawer heroes.",
    "box",
    `Toaster,Kettle,Blender,Microwave,Fridge,Oven,Pressure Cooker,Mixer Grinder,Fan,Air Conditioner,Heater,Washing Machine,Vacuum,Iron,Hair Dryer,Toothbrush,Razor,Soap,Shampoo,Towel,Mirror,Comb,Perfume,Umbrella,Raincoat,Sunglasses,Watch,Wallet,Backpack,Suitcase,Keys,Padlock,Doorbell,Doormat,Curtain,Pillow,Blanket,Mattress,Bunk Bed,Sofa,Chair,Table,Lamp,Candle,Torch,Light Bulb,Remote,Television,Radio,Laptop,Keyboard,Mouse Pad,Printer,Phone,Charger,Headphones,Speaker,Microphone,Camera,Drone,Game Controller,Alarm Clock,Calendar,Notebook,Pencil,Pen,Eraser,Scissors,Stapler,Tape,Glue,Ruler,Calculator,Globe,Balloon,Kite,Yo-Yo,Teddy Bear,Doll,Puzzle,Dice,Playing Cards,Chessboard,Trampoline,Swing,Slide,Bucket,Broom,Mop,Dustbin,Hammer,Screwdriver,Wrench,Drill,Ladder,Saw,Nails,Rope,Chain,Magnet,Battery,Plug,Bicycle Bell,Whistle,Trumpet Horn,Cuckoo Clock,Hourglass,Snow Globe,Piggy Bank`,
  ),
  pack(
    "jobs",
    "Jobs & people at work",
    "Who is that knocking at the door?",
    "briefcase",
    `Doctor,Nurse,Dentist,Surgeon,Pilot,Astronaut,Teacher,Professor,Student,Principal,Police Officer,Firefighter,Detective,Judge,Lawyer,Soldier,Spy,Chef,Baker,Waiter,Barista,Butcher,Farmer,Fisherman,Gardener,Carpenter,Plumber,Electrician,Mechanic,Builder,Painter,Tailor,Barber,Postman,Driver,Bus Conductor,Taxi Driver,Sailor,Captain,Clown,Magician,Acrobat,Singer,Dancer,Actor,Director,Comedian,DJ,Rockstar,Painter,Sculptor,Photographer,Journalist,Author,Librarian,Scientist,Engineer,Programmer,Banker,Cashier,Salesman,Shopkeeper,Receptionist,Security Guard,Lifeguard,Referee,Coach,Umpire,Jockey,Zookeeper,Vet,Pharmacist,Mailman,Janitor,Astronomer,Archaeologist,Inventor,Influencer,Streamer,Youtuber,Politician,King,Queen,Prince,Princess,Pirate,Cowboy,Ninja,Knight,Viking,Samurai`,
  ),
  pack(
    "sports",
    "Sports & games",
    "Play it, shout it, lose at it.",
    "trophy",
    `Cricket,Football,Soccer,Basketball,Baseball,Tennis,Badminton,Table Tennis,Volleyball,Hockey,Golf,Rugby,Boxing,Wrestling,Karate,Judo,Archery,Fencing,Swimming,Diving,Surfing,Sailing,Rowing,Skiing,Snowboarding,Skating,Ice Hockey,Curling,Cycling,Marathon,Sprint,Hurdles,High Jump,Long Jump,Pole Vault,Javelin,Discus,Shot Put,Weightlifting,Gymnastics,Yoga,Aerobics,Skateboard,Bowling,Darts,Snooker,Pool,Carrom,Ludo,Chess,Checkers,Monopoly,Scrabble,Sudoku,Jenga,Kabaddi,Kho Kho,Hide-And-Seek,Tag,Hopscotch,Tug-Of-War,Musical Chairs,Skipping Rope,Marbles,Poker,Bingo,Tic-Tac-Toe,Charades,Trivia,Minecraft,Fortnite,Pac-Man,Tetris,Candy Crush,Among Us,Olympics,World Cup,Penalty,Home Run,Slam Dunk,Hat Trick,Touchdown,Checkmate`,
  ),
  pack(
    "nature",
    "Nature & weather",
    "The great outdoors, indoors in your head.",
    "leaf",
    `Rain,Thunder,Lightning,Storm,Tornado,Hurricane,Blizzard,Snow,Snowman,Hail,Fog,Rainbow,Sunshine,Sunset,Sunrise,Moonlight,Full Moon,Eclipse,Shooting Star,Aurora,Wind,Breeze,Heatwave,Monsoon,Drought,Flood,Earthquake,Tsunami,Avalanche,Volcano,Lava,Geyser,Waterfall,River,Stream,Lake,Pond,Ocean,Wave,Tide,Coral Reef,Beach,Sand Dune,Desert,Oasis,Canyon,Cliff,Mountain,Hill,Valley,Cave,Glacier,Iceberg,Forest,Jungle,Rainforest,Meadow,Swamp,Island,Pine Tree,Palm Tree,Banyan Tree,Bamboo,Cactus,Rose,Sunflower,Lotus,Tulip,Daisy,Orchid,Mushroom,Moss,Seaweed,Acorn,Leaf,Branch,Bonfire,Campfire,Fireworks,Dewdrop,Puddle,Mud,Dust Storm`,
  ),
  pack(
    "vehicles",
    "Vehicles & machines",
    "Things that go, honk and clatter.",
    "car",
    `Car,Taxi,Auto Rickshaw,Bus,Truck,Tractor,Bulldozer,Crane,Forklift,Fire Truck,Ambulance,Police Car,Ice-Cream Van,Motorcycle,Scooter,Bicycle,Tricycle,Skateboard,Roller Skates,Train,Metro,Tram,Steam Engine,Bullet Train,Monorail,Airplane,Helicopter,Jet,Glider,Zeppelin,Parachute,Rocket,Space Shuttle,Satellite,UFO,Submarine,Speedboat,Sailboat,Canoe,Kayak,Ferry,Cruise Ship,Titanic,Pirate Ship,Jet Ski,Sled,Snowmobile,Segway,Wheelchair,Shopping Cart,Rollercoaster,Ferris Wheel,Merry-Go-Round,Bumper Cars,Go Kart,Race Car,Tank,Robot,Drone,Mars Rover,Time Machine,Flying Carpet,Magic Broom`,
  ),
  pack(
    "fantasy",
    "Fantasy & monsters",
    "Dragons, goblins and things under the bed.",
    "wand",
    `Dragon,Unicorn,Phoenix,Griffin,Pegasus,Mermaid,Centaur,Minotaur,Cyclops,Kraken,Yeti,Bigfoot,Loch Ness,Chupacabra,Sasquatch,Godzilla,King Kong,Troll,Goblin,Orc,Ogre,Giant,Dwarf,Elf,Fairy,Pixie,Gnome,Leprechaun,Wizard,Sorcerer,Warlock,Witch Hat,Magic Wand,Crystal Ball,Potion,Spellbook,Broomstick,Cauldron,Genie Lamp,Flying Carpet,Treasure Chest,Pirate Gold,Haunted House,Graveyard,Skeleton,Mummy,Poltergeist,Banshee,Grim Reaper,Alien,Robot,Cyborg,Time Traveler,Superhero,Supervillain,Sidekick,Jedi,Lightsaber,Death Star,Wormhole,Black Hole,Portal,Invisibility Cloak,Dragon Egg,Excalibur,Round Table,Camelot,Atlantis,El Dorado,Narnia,Hogwarts,Wonderland`,
  ),
  pack(
    "movies",
    "Movies & shows",
    "Titles everybody has opinions about.",
    "film",
    `Titanic,Avatar,Jaws,Frozen,Moana,Coco,Up,Cars,Ratatouille,Finding Nemo,Toy Story,Lion King,Jungle Book,Aladdin,Mulan,Brave,Shrek,Madagascar,Po,Despicable Me,Minions,Ice Age,Star Wars,Star Trek,Jurassic Park,Gladiator,Matrix,Inception,Interstellar,Gravity,Avengers,Black Panther,Iron Man,Joker,Batman Begins,Spider-Man,Harry Potter,Fellowship,Hobbit,Narnia,Twilight,Hunger Games,Jack Sparrow,Fast Furious,Mission Impossible,Home Alone,Mrs Doubtfire,Forrest Gump,Rocky,Terminator,Alien,Ghostbusters,Delorean,Sholay,Dangal,Lagaan,3 Idiots,Dilwale,Baahubali,RRR,Pushpa,Kabir Singh,Gully Boy,Mughal-E-Azam,Mother India,Friends,Jon Snow,Breaking Bad,Stranger Things,Squid Game,Money Heist,Sherlock,The Office,Simpsons,Pokemon,Naruto,Dragon Ball,One Piece,Tom Jerry,Mr Bean,Taarak Mehta,CID,Shaktimaan`,
  ),
  pack(
    "music",
    "Music & instruments",
    "Anything that can be strummed, banged or belted.",
    "music",
    `Guitar,Electric Guitar,Bass Guitar,Piano,Keyboard,Organ,Violin,Cello,Harp,Flute,Clarinet,Saxophone,Trumpet,Trombone,Tuba,Bagpipes,Harmonica,Accordion,Ukulele,Banjo,Mandolin,Sitar,Tabla,Sarod,Santoor,Harmonium,Dholak,Dhol,Veena,Shehnai,Bansuri,Drums,Bongo,Conga,Tambourine,Maracas,Cymbals,Triangle,Xylophone,Kazoo,Whistle,Recorder,Gong,Church Bell,Wind Chimes,Music Box,Jukebox,Karaoke,Orchestra,Choir,Opera,Rap,Rock,Jazz,Blues,Disco,Reggae,Hip Hop,Pop Star,Boy Band,Lullaby,Anthem,Serenade,Duet,Solo,Encore,Concert,Festival,Soundcheck,Beatbox,Yodel,Whistling,Humming,Singing`,
  ),
  pack(
    "actions",
    "Everyday actions",
    "Noises humans make just by living.",
    "activity",
    `Sneeze,Cough,Hiccup,Yawn,Snore,Burp,Giggle,Laugh,Cry,Scream,Whisper,Shout,Sigh,Gasp,Sob,Cheer,Clap,Snap,Whistle,Hum,Sing,Gulp,Slurp,Munch,Crunch,Chew,Sip,Drool,Sniff,Gargle,Brush Teeth,Wash Hands,Flush,Shower,Splash,Swim,Dive,Jump,Hop,Skip,Run,Sprint,Walk,Tiptoe,Stomp,March,Dance,Spin,Fall,Trip,Slip,Crash,Bounce,Climb,Crawl,Sneak,Knock,Ring,Tap,Type,Scroll,Swipe,Zip,Unzip,Button,Pour,Stir,Chop,Slice,Peel,Fry,Boil,Bake,Sweep,Scrub,Iron,Fold,Hang,Wrap,Tear,Crumple,Pop,Burst,Shatter,Shake,Rattle,Drop,Throw,Catch,Kick,Punch,Whack,Slap,Hug,Tickle`,
  ),
  pack(
    "science",
    "Science & space",
    "Big ideas, small words.",
    "rocket",
    `Gravity,Magnet,Electricity,Atom,Molecule,Proton,Neutron,Electron,Laser,Radar,Radio Wave,X-Ray,Microscope,Telescope,Test Tube,Beaker,Lab Coat,Periodic Table,Chemistry,Physics,Biology,Fossil,Dinosaur,Skeleton,Brain,Heart,Lungs,Stomach,DNA,Virus,Bacteria,Vaccine,Stethoscope,Thermometer,Sun,Moon,Earth,Mercury,Venus,Mars,Jupiter,Saturn,Uranus,Neptune,Pluto,Comet,Asteroid,Meteor,Galaxy,Milky Way,Nebula,Supernova,Black Hole,Big Bang,Solar System,Space Station,Astronaut,Moon Landing,Rocket Launch,Satellite Dish,Robot Arm,Artificial Intelligence,Internet,Wi-Fi,Bluetooth,Computer,Binary,Pixel,Hologram,Circuit,Battery,Solar Panel,Wind Turbine,Volcano,Earthquake,Compass,Barometer`,
  ),
];

export const PACK_IDS = WORD_PACKS.map((p) => p.id);
const byId = Object.fromEntries(WORD_PACKS.map((p) => [p.id, p]));
export const WORD_TOTAL = WORD_PACKS.reduce((n, p) => n + p.words.length, 0);

/** Valid values for the "wordPack" room setting. "sounds" is the original sound-idea list, "mixed" is the whole library. */
export const WORD_SETTINGS = ["sounds", "mixed", ...PACK_IDS];

/** Words for a setting. "sounds" returns null so the caller uses the curated sound prompts. */
export function wordsFor(setting) {
  if (setting === "sounds") return null;
  if (setting === "mixed") return WORD_PACKS.flatMap((p) => p.words);
  return byId[setting]?.words || null;
}

/** A starting word is one or two words, never a sentence. Returns the cleaned word or null. */
export function cleanStartingWord(text) {
  if (typeof text !== "string") return null;
  const cleaned = text.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(" ");
  if (!cleaned || parts.length > 2 || cleaned.length > 30) return null;
  if (
    !parts.every(
      (w) => /^[\p{L}\p{N}][\p{L}\p{N}'’.\-]*$/u.test(w) && w.length <= 20,
    )
  )
    return null;
  return cleaned;
}

/** Category cards for the browser: size and a few random samples, never the full list. */
export function libraryOverview(samples = 6) {
  const pick = (words) => {
    const copy = [...words];
    const out = [];
    while (out.length < samples && copy.length)
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    return out;
  };
  return {
    total: WORD_TOTAL,
    packs: WORD_PACKS.map(({ id, name, blurb, icon, words }) => ({
      id,
      name,
      blurb,
      icon,
      count: words.length,
      samples: pick(words),
    })),
  };
}
