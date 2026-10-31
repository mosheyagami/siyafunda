import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  AudioWaveform,
  Check,
  ChevronRight,
  Flame,
  GripVertical,
  Mic,
  MicOff,
  Plus,
  Pencil,
  RotateCcw,
  Settings2,
  SkipForward,
  Sparkles,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import Levenshtein from "fast-levenshtein";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

const STORIES = [
  {
    id: "fox",
    title: "The Fox and the Moon",
    level: "Starter",
    minutes: 2,
    color: "coral",
    text: "A small fox walks under the moon. The moon shines on the quiet path. Fox finds a red leaf and carries it home.",
    chapters: [
      {
        title: "Under the Moon",
        text: "A small fox walks under the moon. The moon shines on the quiet path.",
      },
      {
        title: "The Red Leaf",
        text: "Fox finds a red leaf and carries it home.",
      },
    ],
  },
  {
    id: "garden",
    title: "A Garden Surprise",
    level: "Growing",
    minutes: 3,
    color: "teal",
    text: "A tiny seed rests in warm soil. It gets water each day. Soon, a bright yellow flower opens.",
    chapters: [
      { title: "A Tiny Seed", text: "A tiny seed rests in warm soil." },
      {
        title: "A Bright Flower",
        text: "It gets water each day. Soon, a bright yellow flower opens.",
      },
    ],
  },
  {
    id: "kite",
    title: "The Red Kite",
    level: "Confident",
    minutes: 3,
    color: "gold",
    text: "A child runs across the wide green field with a red kite. The wind lifts it high above the trees. The kite dances in the sky.",
    chapters: [
      {
        title: "The Wide Field",
        text: "A child runs across the wide green field with a red kite.",
      },
      {
        title: "Up in the Sky",
        text: "The wind lifts it high above the trees. The kite dances in the sky.",
      },
    ],
  },
  {
    id: "rainy-day",
    title: "Puddles After the Rain",
    level: "Starter",
    minutes: 2,
    color: "violet",
    text: "Rain taps on the roof. Sam puts on yellow boots. Outside, a big puddle makes a bright splash. Sam laughs and walks home in the sun.",
    chapters: [
      {
        title: "Rain on the Roof",
        text: "Rain taps on the roof. Sam puts on yellow boots.",
      },
      {
        title: "A Bright Splash",
        text: "Outside, a big puddle makes a bright splash. Sam laughs and walks home in the sun.",
      },
    ],
  },
  {
    id: "busy-bee",
    title: "Bee's Busy Morning",
    level: "Starter",
    minutes: 2,
    color: "gold",
    text: "Bee wakes up beside a pink flower. She visits the garden and finds more flowers. By noon, her little basket is full of sweet pollen.",
    chapters: [
      {
        title: "The First Flower",
        text: "Bee wakes up beside a pink flower.",
      },
      {
        title: "A Full Basket",
        text: "She visits the garden and finds more flowers. By noon, her little basket is full of sweet pollen.",
      },
    ],
  },
  {
    id: "lost-button",
    title: "The Missing Button",
    level: "Growing",
    minutes: 2,
    color: "coral",
    text: "Lebo finds a shiny button under the table. It is blue and round. She asks her family who lost it. Grandma smiles and sews it onto her coat.",
    chapters: [
      {
        title: "Under the Table",
        text: "Lebo finds a shiny button under the table. It is blue and round.",
      },
      {
        title: "Grandma's Coat",
        text: "She asks her family who lost it. Grandma smiles and sews it onto her coat.",
      },
    ],
  },
  {
    id: "market-morning",
    title: "A Morning at the Market",
    level: "Growing",
    minutes: 3,
    color: "teal",
    text: "Mina walks to the market with her dad. They choose ripe mangoes, fresh bread, and a bunch of carrots. Mina carries the light bag while Dad pays. At home, they make lunch together.",
    chapters: [
      {
        title: "Choosing Lunch",
        text: "Mina walks to the market with her dad. They choose ripe mangoes, fresh bread, and a bunch of carrots.",
      },
      {
        title: "Home for Lunch",
        text: "Mina carries the light bag while Dad pays. At home, they make lunch together.",
      },
    ],
  },
  {
    id: "tall-tree",
    title: "The Tall Tree",
    level: "Growing",
    minutes: 3,
    color: "gold",
    text: "A little bird wants to build a nest in the tallest tree. The wind shakes the branches, so she searches for a safer place. She finds a strong fork in the trunk and gathers soft grass. Soon, her new home is ready.",
    chapters: [
      {
        title: "A Safe Place",
        text: "A little bird wants to build a nest in the tallest tree. The wind shakes the branches, so she searches for a safer place.",
      },
      {
        title: "A New Nest",
        text: "She finds a strong fork in the trunk and gathers soft grass. Soon, her new home is ready.",
      },
    ],
  },
  {
    id: "river-bridge",
    title: "The Little River Bridge",
    level: "Confident",
    minutes: 3,
    color: "violet",
    text: "After a night of rain, a stream runs fast across the walking path. A group of friends gathers smooth stones and long sticks. Together, they make a small bridge over the water. They test it carefully, then cross one at a time.",
    chapters: [
      {
        title: "A Path Under Water",
        text: "After a night of rain, a stream runs fast across the walking path. A group of friends gathers smooth stones and long sticks.",
      },
      {
        title: "Crossing Together",
        text: "Together, they make a small bridge over the water. They test it carefully, then cross one at a time.",
      },
    ],
  },
  {
    id: "star-map",
    title: "Nia's Star Map",
    level: "Confident",
    minutes: 3,
    color: "coral",
    text: "Nia looks at the night sky with her uncle. He shows her how a few bright stars make a shape like a spoon. Nia draws the pattern in her notebook and marks the north star. She takes the map outside again the next evening and finds the same stars.",
    chapters: [
      {
        title: "Shapes in the Sky",
        text: "Nia looks at the night sky with her uncle. He shows her how a few bright stars make a shape like a spoon.",
      },
      {
        title: "Finding North",
        text: "Nia draws the pattern in her notebook and marks the north star. She takes the map outside again the next evening and finds the same stars.",
      },
    ],
  },
];

const STORAGE_KEY = "siyafunda-reader-state";
const CUSTOM_STORIES_KEY = "siyafunda-custom-stories";
const cleanWord = (word) => word.toLowerCase().replace(/[^a-z']/g, "");
const DEFAULT_ACCESSIBILITY = {
  fontSize: "1",
  fontFamily: "archivo",
  spacing: "1",
  lineHeight: "1.35",
  tint: "cream",
  bionic: true,
};

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-ZA", name: "English (South Africa)" },
  { code: "zu-ZA", name: "Zulu" },
  { code: "af-ZA", name: "Afrikaans" },
];
const LANTERN_COLORS = {
  coral: "#F2789F",
  teal: "#7FC29B",
  gold: "#FFA94D",
  violet: "#B48CE0",
};
const STORY_FONTS = {
  archivo: "'Archivo Black', 'Baloo 2', sans-serif",
  rubik: "'Rubik Spray Paint', 'Baloo 2', sans-serif",
  roboto: "'Roboto', 'Baloo 2', sans-serif",
  openSans: "'Open Sans', 'Baloo 2', sans-serif",
};
const dateKey = () => new Date().toISOString().slice(0, 10);

function LanternIcon({ kind, color }) {
  const stroke = "#3B2A20";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 3,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  if (kind === "cloud")
    return (
      <svg viewBox="0 0 60 60" width="34" height="34">
        <path
          d="M14 38c-6 0-9-8-3-11 1-8 15-10 18-2 8-1 12 9 4 12"
          {...common}
          fill={color}
        />
      </svg>
    );
  if (kind === "frog")
    return (
      <svg viewBox="0 0 60 60" width="34" height="34">
        <ellipse
          cx="30"
          cy="34"
          rx="16"
          ry="12"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="22"
          r="6"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
        <circle
          cx="38"
          cy="22"
          r="6"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
        <circle cx="20" cy="22" r="2" fill={stroke} />
        <circle cx="38" cy="22" r="2" fill={stroke} />
      </svg>
    );
  if (kind === "fish")
    return (
      <svg viewBox="0 0 60 60" width="34" height="34">
        <path
          d="M10 30c8-12 30-12 38 0-8 12-30 12-38 0Z"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
        <path
          d="M46 24l8-6v24l-8-6"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
        <circle cx="20" cy="28" r="1.6" fill={stroke} />
      </svg>
    );
  if (kind === "sock")
    return (
      <svg viewBox="0 0 60 60" width="34" height="34">
        <path
          d="M24 10h12v20l10 8c4 3 2 10-4 10H22c-5 0-8-4-8-9V10Z"
          fill={color}
          stroke={stroke}
          strokeWidth="3"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 60 60" width="34" height="34">
      <path
        d="M12 40c2-16 12-24 22-22 8 2 12 10 8 16 6-2 10 4 6 8-6 6-28 6-36-2Z"
        fill={color}
        stroke={stroke}
        strokeWidth="3"
      />
      <circle cx="22" cy="26" r="2" fill={stroke} />
    </svg>
  );
}

function Firefly({ delay, left, top }) {
  return (
    <span
      className="firefly"
      style={{ left, top, animationDelay: `${delay}s` }}
    />
  );
}

export default function SiyafundaReader() {
  const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const [customStories, setCustomStories] = useState(() =>
    JSON.parse(localStorage.getItem(CUSTOM_STORIES_KEY) || "[]"),
  );
  const allStories = useMemo(
    () => [...STORIES, ...customStories],
    [customStories],
  );
  const [selectedStoryId, setSelectedStoryId] = useState(
    savedState.selectedStoryId || STORIES[0].id,
  );
  const [chapterIndex, setChapterIndex] = useState(0);
  const initialStory =
    allStories.find(
      (item) => item.id === (savedState.selectedStoryId || STORIES[0].id),
    ) || STORIES[0];
  const initialChapter = initialStory.chapters?.[0] || {
    title: "Chapter 1",
    text: initialStory.text,
  };
  const [wordStatuses, setWordStatuses] = useState(() =>
    initialChapter.text
      .split(" ")
      .map((word) => ({ text: word, status: "pending" })),
  );
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [lastHeard, setLastHeard] = useState("Ready when you are");
  const [micError, setMicError] = useState("");
  const [recognitionWarning, setRecognitionWarning] = useState("");
  const [typedWord, setTypedWord] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showAddStory, setShowAddStory] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [newStory, setNewStory] = useState({
    title: "",
    level: "Starter",
    chapters: [{ id: "chapter-1", title: "Chapter 1", text: "" }],
  });
  const [rate, setRate] = useState(savedState.rate || "0.7");
  const [accessibility, setAccessibility] = useState({
    ...DEFAULT_ACCESSIBILITY,
    ...(savedState.accessibility || {}),
  });
  const [language, setLanguage] = useState(savedState.language || "en-US");
  const [readIds, setReadIds] = useState(savedState.readIds || []);
  const [missedWords, setMissedWords] = useState(savedState.missedWords || {});
  const [streak, setStreak] = useState(
    savedState.streak || { count: 0, lastDate: "" },
  );
  const [coins, setCoins] = useState(savedState.coins || 0);
  const [badges, setBadges] = useState(savedState.badges || []);
  const [mood, setMood] = useState("open");
  const [showJar, setShowJar] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [hesitating, setHesitating] = useState(false);
  const activeWordRef = useRef(0);
  const processedTokenCount = useRef(0);
  const hesitationTimerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const meterFrameRef = useRef(null);
  const micStreamRef = useRef(null);
  const recognitionTimerRef = useRef(null);
  const shouldContinueRecognitionRef = useRef(false);
  const recognitionHandlersRef = useRef(null);

  const story =
    allStories.find((item) => item.id === selectedStoryId) || STORIES[0];
  const chapters = useMemo(
    () => story.chapters || [{ title: "Chapter 1", text: story.text }],
    [story.chapters, story.text],
  );
  const chapter = chapters[chapterIndex] || chapters[0];
  const targetWords = useMemo(() => chapter.text.split(" "), [chapter.text]);

  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const attachRecognitionHandlers = useCallback(() => {
    const recognition = SpeechRecognition.getRecognition();
    if (!recognition) return;
    if (recognitionHandlersRef.current) {
      const {
        recognition: previousRecognition,
        onError,
        onEnd,
      } = recognitionHandlersRef.current;
      previousRecognition.removeEventListener("error", onError);
      previousRecognition.removeEventListener("end", onEnd);
    }
    const onError = (event) => {
      const errorCode = event?.error || "unknown";
      console.error("Speech recognition error:", errorCode);
      const messages = {
        "no-speech": "No speech was heard. Try speaking closer to the phone.",
        network:
          "Speech recognition could not reach the browser service. Check the internet connection or use Chrome.",
        "not-allowed":
          "Speech recognition permission was denied. Check the browser microphone permission.",
        aborted:
          "Speech recognition stopped. Press Start reading to try again.",
      };
      setRecognitionWarning(
        messages[errorCode] || `Speech recognition error: ${errorCode}`,
      );
    };
    const onEnd = () => {
      if (shouldContinueRecognitionRef.current) {
        window.setTimeout(() => {
          if (shouldContinueRecognitionRef.current) {
            attachRecognitionHandlers();
            SpeechRecognition.startListening({
              continuous: false,
              language: language,
            }).catch((error) => {
              console.error("Restart failed:", error);
              setRecognitionWarning(
                "Listening stopped unexpectedly. Press Start reading to try again.",
              );
              shouldContinueRecognitionRef.current = false;
              setIsReading(false);
            });
          }
        }, 150);
      }
    };
    recognition.addEventListener("error", onError);
    recognition.addEventListener("end", onEnd);
    recognitionHandlersRef.current = { recognition, onError, onEnd };
  }, []);

  const completedWords = wordStatuses.filter(
    (item) => item.status === "correct",
  ).length;
  const progress = targetWords.length
    ? Math.round((completedWords / targetWords.length) * 100)
    : 0;
  const isFinished = activeWordIndex >= targetWords.length;
  const fireflies = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: `${(index * 37) % 100}%`,
        top: `${(index * 53) % 70}%`,
        delay: (index % 8) * 0.4,
      })),
    [],
  );

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        selectedStoryId,
        rate,
        accessibility,
        language,
        readIds,
        missedWords,
        streak,
        coins,
        badges,
      }),
    );
  }, [
    selectedStoryId,
    rate,
    accessibility,
    language,
    readIds,
    missedWords,
    streak,
    coins,
    badges,
  ]);

  useEffect(() => {
    localStorage.setItem(CUSTOM_STORIES_KEY, JSON.stringify(customStories));
  }, [customStories]);

  const resetAll = () => {
    stopReading();
    window.clearTimeout(hesitationTimerRef.current);
    setHesitating(false);
    setIsReading(false);
    resetTranscript();
    window.clearTimeout(recognitionTimerRef.current);
    setRecognitionWarning("");
    processedTokenCount.current = 0;
    activeWordRef.current = 0;
    setActiveWordIndex(0);
    setWordStatuses(
      targetWords.map((word) => ({ text: word, status: "pending" })),
    );
    setLastHeard("Ready when you are");
    setTypedWord("");
  };

  const resetUserData = () => {
    const confirmed = window.confirm(
      "Reset all Siyafunda user data? This removes reading progress, rewards, preferences, and custom stories. This cannot be undone.",
    );
    if (!confirmed) return;

    stopReading();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CUSTOM_STORIES_KEY);
    window.location.reload();
  };

  const stopReading = useCallback(() => {
    shouldContinueRecognitionRef.current = false;
    SpeechRecognition.stopListening();
    if (meterFrameRef.current)
      window.cancelAnimationFrame(meterFrameRef.current);
    meterFrameRef.current = null;
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    if (micStreamRef.current)
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    micStreamRef.current = null;
    setMicLevel(0);
    setIsReading(false);
    window.clearTimeout(recognitionTimerRef.current);
    setRecognitionWarning("");
    if (recognitionHandlersRef.current) {
      const { recognition, onError, onEnd } = recognitionHandlersRef.current;
      recognition.removeEventListener("error", onError);
      recognition.removeEventListener("end", onEnd);
      recognitionHandlersRef.current = null;
    }
  }, []);

  const recordPracticeDay = useCallback(() => {
    const today = dateKey();
    setStreak((previous) => {
      if (previous.lastDate === today) return previous;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const continued =
        previous.lastDate === yesterday.toISOString().slice(0, 10);
      return { count: continued ? previous.count + 1 : 1, lastDate: today };
    });
  }, []);

  const recordMiss = useCallback((word) => {
    const key = cleanWord(word);
    if (!key) return;
    setMissedWords((previous) => ({
      ...previous,
      [key]: (previous[key] || 0) + 1,
    }));
  }, []);

  function readMicLevel() {
    if (!analyserRef.current) return;
    const samples = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(samples);
    const volume =
      samples.reduce((total, sample) => total + Math.abs(sample - 128), 0) /
      samples.length;
    setMicLevel(Math.min(100, Math.round(volume * 2.8)));
    meterFrameRef.current = window.requestAnimationFrame(readMicLevel);
  }

  const finishChapter = useCallback(() => {
    stopReading();
    if (chapterIndex + 1 < chapters.length) {
      const nextChapterIndex = chapterIndex + 1;
      setChapterIndex(nextChapterIndex);
      activeWordRef.current = 0;
      setActiveWordIndex(0);
      setWordStatuses(
        chapters[nextChapterIndex].text
          .split(" ")
          .map((word) => ({ text: word, status: "pending" })),
      );
      resetTranscript();
      processedTokenCount.current = 0;
      setLastHeard(`Chapter ${nextChapterIndex + 1} is ready.`);
      return;
    }
    // Story is complete - record streak and award badges
    recordPracticeDay();

    // Add story to read list if not already there
    if (!readIds.includes(story.id)) {
      setReadIds([...readIds, story.id]);
    }

    // Count missed words and award coins/badges
    const missedCount = wordStatuses.filter(
      (w) => w.status === "incorrect",
    ).length;
    const chapterCoins = missedCount === 0 ? 15 : 5;
    setCoins((prev) => prev + chapterCoins);

    // Check for badges
    const newBadges = [...badges];
    const badgeSet = new Set(badges);

    // Story-specific badges
    const storyTitles = {
      fox: "Fox Reader",
      garden: "Garden Guardian",
      kite: "Kite Master",
    };

    if (story.id in storyTitles && !badgeSet.has(storyTitles[story.id])) {
      newBadges.push(storyTitles[story.id]);
      badgeSet.add(storyTitles[story.id]);
    }

    // Collection badges (use readIds.length + 1 since we just added current story)
    const totalRead = readIds.includes(story.id)
      ? readIds.length
      : readIds.length + 1;
    if (totalRead === 1 && !badgeSet.has("Story Starter")) {
      newBadges.push("Story Starter");
      badgeSet.add("Story Starter");
    } else if (totalRead === 5 && !badgeSet.has("Five Tales Reader")) {
      newBadges.push("Five Tales Reader");
      badgeSet.add("Five Tales Reader");
    } else if (totalRead === 10 && !badgeSet.has("Ten Tales Reader")) {
      newBadges.push("Ten Tales Reader");
      badgeSet.add("Ten Tales Reader");
    }

    // Flawless chapter badge
    if (missedCount === 0 && !badgeSet.has("Flawless Reader")) {
      newBadges.push("Flawless Reader");
      badgeSet.add("Flawless Reader");
    }

    // Streak badges
    if (streak.count === 7 && !badgeSet.has("Week Warrior")) {
      newBadges.push("Week Warrior");
      badgeSet.add("Week Warrior");
    } else if (streak.count === 30 && !badgeSet.has("Month Master")) {
      newBadges.push("Month Master");
      badgeSet.add("Month Master");
    }

    if (newBadges.length > badges.length) {
      setBadges(newBadges);
    }

    setLastHeard("Story complete. Lovely reading!");
    setMood("cheer");
    setShowCelebration(true);
  }, [
    chapterIndex,
    chapters,
    resetTranscript,
    stopReading,
    story.id,
    wordStatuses,
    streak,
    readIds,
    badges,
    recordPracticeDay,
  ]);

  const markWordAndAdvance = useCallback(
    (status) => {
      const currentIndex = activeWordRef.current;
      if (currentIndex >= targetWords.length) return;
      setWordStatuses((previous) =>
        previous.map((item, index) =>
          index === currentIndex ? { ...item, status } : item,
        ),
      );
      const nextIndex = currentIndex + 1;
      activeWordRef.current = nextIndex;
      setActiveWordIndex(nextIndex);
      setHesitating(false);
      if (nextIndex >= targetWords.length) {
        finishChapter();
      }
    },
    [finishChapter, targetWords],
  );

  const isFuzzyMatch = (spoken, target) => {
    const cleanSpoken = cleanWord(spoken);
    const cleanTarget = cleanWord(target);

    if (!cleanSpoken || !cleanTarget) return false;
    if (cleanSpoken === cleanTarget) return true;
    const maxDistance = cleanTarget.length > 4 ? 2 : 1;
    return Levenshtein.get(cleanSpoken, cleanTarget) <= maxDistance;
  };

  const evaluateWord = useCallback(
    (spokenWord) => {
      const currentIndex = activeWordRef.current;
      if (currentIndex >= targetWords.length) return;
      const currentTargetWord = targetWords[currentIndex];
      const nextMatches =
        currentIndex + 1 < targetWords.length &&
        isFuzzyMatch(spokenWord, targetWords[currentIndex + 1]);
      const correct = isFuzzyMatch(spokenWord, currentTargetWord);
      setLastHeard(spokenWord);
      if (correct || nextMatches) {
        window.clearTimeout(hesitationTimerRef.current);
        setHesitating(false);
        setRecognitionWarning("");
      }
      if (!correct && !nextMatches) {
        recordMiss(currentTargetWord);
        setHesitating(true);
        if (!hesitationTimerRef.current) {
          hesitationTimerRef.current = window.setTimeout(() => {
            hesitationTimerRef.current = null;
            markWordAndAdvance("incorrect");
          }, 2000);
        }
        return;
      }
      if (nextMatches) {
        recordMiss(currentTargetWord);
        setWordStatuses((previous) =>
          previous.map((item, index) => {
            if (index === currentIndex) return { ...item, status: "incorrect" };
            if (index === currentIndex + 1)
              return { ...item, status: "correct" };
            return item;
          }),
        );
        activeWordRef.current = currentIndex + 2;
        setActiveWordIndex(currentIndex + 2);
        if (currentIndex + 2 >= targetWords.length) {
          finishChapter();
        }
        return;
      }
      setWordStatuses((previous) =>
        previous.map((item, index) => {
          if (index === currentIndex)
            return { ...item, status: correct ? "correct" : "incorrect" };
          if (nextMatches && index === currentIndex + 1)
            return { ...item, status: "correct" };
          return item;
        }),
      );
      markWordAndAdvance("correct");
    },
    [finishChapter, markWordAndAdvance, recordMiss, targetWords],
  );

  useEffect(() => {
    if (!transcript.trim()) return;
    const spokenTokens = transcript.trim().split(/\s+/);
    const newTokens = spokenTokens.slice(processedTokenCount.current);
    processedTokenCount.current = spokenTokens.length;
    newTokens.forEach(evaluateWord);
  }, [transcript, evaluateWord]);

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = Number(rate);
    window.speechSynthesis.speak(utterance);
  };

  const startReading = async () => {
    setMicError("");
    if (
      !window.isSecureContext &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setMicError(
        "Microphone access needs HTTPS on a phone. Open the secure app link, then try again.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError(
        "This browser does not provide microphone access. Use Chrome on Android or type the words below.",
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        audioContextRef.current
          .createMediaStreamSource(stream)
          .connect(analyserRef.current);
        readMicLevel();
      }
      resetTranscript();
      processedTokenCount.current = 0;
      setLastHeard("Listening for your voice...");
      setIsReading(true);
      shouldContinueRecognitionRef.current = true;
      recordPracticeDay();
      setRecognitionWarning("");
      window.clearTimeout(recognitionTimerRef.current);
      recognitionTimerRef.current = window.setTimeout(() => {
        setRecognitionWarning(
          "Your microphone is on, but no words were heard. Try speaking closer to the phone, or use Chrome for voice reading.",
        );
      }, 5000);
      attachRecognitionHandlers();
      await SpeechRecognition.startListening({
        continuous: true,
        language: language,
      });
    } catch (error) {
      stopReading();
      setMicError(
        error.name === "NotAllowedError"
          ? "Microphone permission is blocked. Allow it in your browser settings, then try again."
          : "The microphone could not start. Check that another app is not using it, then try again.",
      );
      SpeechRecognition.stopListening();
    }
  };

  const retryWord = () => {
    window.clearTimeout(hesitationTimerRef.current);
    setHesitating(false);
    setLastHeard("Try the word again");
    resetTranscript();
    processedTokenCount.current = 0;
  };

  const skipWord = () => {
    window.clearTimeout(hesitationTimerRef.current);
    recordMiss(targetWords[activeWordRef.current]);
    markWordAndAdvance("incorrect");
    setLastHeard("Word skipped");
  };

  const beginSelectedStory = async () => {
    if (isFinished) resetAll();
    await startReading();
  };

  const selectStory = (item) => {
    stopReading();
    setSelectedStoryId(item.id);
    setChapterIndex(0);
    activeWordRef.current = 0;
    setActiveWordIndex(0);
    const firstChapter = item.chapters?.[0] || {
      title: "Chapter 1",
      text: item.text,
    };
    setWordStatuses(
      firstChapter.text
        .split(" ")
        .map((word) => ({ text: word, status: "pending" })),
    );
    processedTokenCount.current = 0;
    resetTranscript();
    setLastHeard("Ready when you are");
    setHesitating(false);
  };

  const selectChapter = (index) => {
    stopReading();
    setChapterIndex(index);
    activeWordRef.current = 0;
    setActiveWordIndex(0);
    setWordStatuses(
      (chapters[index] || chapters[0]).text
        .split(" ")
        .map((word) => ({ text: word, status: "pending" })),
    );
    processedTokenCount.current = 0;
    resetTranscript();
    setLastHeard("Ready when you are");
    setHesitating(false);
  };

  const renderWord = (word) => {
    if (!accessibility.bionic) return word;
    const match = word.match(/^([A-Za-z']+)(.*)$/);
    if (!match) return word;
    const focusLength = Math.max(1, Math.ceil(match[1].length * 0.42));
    return (
      <>
        <strong>{match[1].slice(0, focusLength)}</strong>
        {match[1].slice(focusLength)}
        {match[2]}
      </>
    );
  };

  const addStory = (event) => {
    event.preventDefault();
    const title = newStory.title.trim();
    const chaptersToSave = newStory.chapters
      .map((item, index) => ({
        title: item.title.trim() || `Chapter ${index + 1}`,
        text: item.text.trim().replace(/\s+/g, " "),
      }))
      .filter((item) => item.text.split(" ").length >= 3);
    if (!title || chaptersToSave.length === 0) return;
    const text = chaptersToSave.map((item) => item.text).join(" ");
    const storyToAdd = {
      id: newStory.id || `custom-${Date.now()}`,
      title,
      text,
      level: newStory.level,
      minutes: Math.max(1, Math.ceil(text.split(" ").length / 85)),
      color: "teal",
      custom: true,
      chapters: chaptersToSave,
    };
    setCustomStories((previous) =>
      newStory.id
        ? previous.map((item) => (item.id === newStory.id ? storyToAdd : item))
        : [...previous, storyToAdd],
    );
    setSelectedStoryId(storyToAdd.id);
    setChapterIndex(0);
    const firstChapter = chaptersToSave[0];
    setWordStatuses(
      firstChapter.text
        .split(" ")
        .map((word) => ({ text: word, status: "pending" })),
    );
    activeWordRef.current = 0;
    setActiveWordIndex(0);
    setLastHeard("Ready when you are");
    setNewStory({
      title: "",
      level: "Starter",
      chapters: [{ id: "chapter-1", title: "Chapter 1", text: "" }],
    });
    setShowAddStory(false);
  };

  const editStory = (item) => {
    setNewStory({
      id: item.id,
      title: item.title,
      level: item.level,
      chapters: (
        item.chapters || [{ title: "Chapter 1", text: item.text }]
      ).map((chapterItem, index) => ({
        ...chapterItem,
        id: chapterItem.id || `${item.id}-chapter-${index}`,
      })),
    });
    setShowAddStory(true);
  };

  const beginNewStory = () => {
    setNewStory({
      title: "",
      level: "Starter",
      chapters: [{ id: "chapter-1", title: "Chapter 1", text: "" }],
    });
    setShowAddStory(true);
  };

  const reorderChapters = ({ source, destination }) => {
    if (!destination || source.index === destination.index) return;
    setNewStory((previous) => {
      const chapters = [...previous.chapters];
      const [movedChapter] = chapters.splice(source.index, 1);
      chapters.splice(destination.index, 0, movedChapter);
      return { ...previous, chapters };
    });
  };

  const removeStory = (storyId) => {
    setCustomStories((previous) =>
      previous.filter((item) => item.id !== storyId),
    );
    if (selectedStoryId === storyId) {
      setSelectedStoryId(STORIES[0].id);
      resetAll();
    }
  };

  const submitTypedWord = (event) => {
    event.preventDefault();
    if (!typedWord.trim()) return;
    recordPracticeDay();
    evaluateWord(typedWord.trim());
    setTypedWord("");
  };

  const generateProgressReport = () => {
    const reportDate = new Date().toLocaleDateString();
    const totalWords = Object.keys(missedWords).length;
    const trickyWords = Object.entries(missedWords)
      .sort(([, first], [, second]) => second - first)
      .slice(0, 10)
      .map(([word, count]) => `${word} (${count} misses)`)
      .join("\n");

    const csvContent = [
      "SIYAFUNDA READING PRACTICE REPORT",
      `Generated: ${reportDate}`,
      "",
      "STUDENT PROGRESS",
      `Stories Completed: ${readIds.length}`,
      `Reading Streak: ${streak.count} days`,
      `Total Coins Earned: ${coins}`,
      `Badges Earned: ${badges.length}`,
      `Language: ${LANGUAGES.find((l) => l.code === language)?.name || language}`,
      "",
      "STORIES READ",
      readIds
        .map((id) => {
          const s = allStories.find((story) => story.id === id);
          return s ? `• ${s.title} (${s.level})` : "";
        })
        .filter(Boolean)
        .join("\n"),
      "",
      "PRONUNCIATION PRACTICE",
      `Unique Words Practiced: ${totalWords}`,
      `Total Mistakes: ${Object.values(missedWords).reduce((a, b) => a + b, 0)}`,
      "",
      "TOP 10 WORDS TO PRACTICE",
      trickyWords,
      "",
      "BADGES EARNED",
      badges.join("\n"),
      "",
      "RECOMMENDATIONS",
      readIds.length === 0 ? "• Start by completing your first story!" : "",
      totalWords > 10 ? "• Focus on these tricky words this week" : "",
      streak.count >= 7
        ? "• Great streak! Keep reading daily"
        : "• Try to read something every day for a 7-day streak",
      "",
      "FOR PARENTS/TEACHERS",
      "• Review the 'Words to Practice' section above",
      "• Celebrate your child's badges - each one represents an achievement!",
      "• Encourage daily reading for better progress",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `siyafunda-report-${reportDate.replace(/\//g, "-")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lantern-shell">
      {fireflies.map((firefly) => (
        <Firefly key={firefly.id} {...firefly} />
      ))}
      <div className="moon" />
      <header className="lantern-header">
        <div className="owl-wrap">
          <svg viewBox="0 0 100 100" width="72" height="72">
            <ellipse cx="50" cy="58" rx="34" ry="30" fill="#8C6A4F" />
            <circle cx="38" cy="46" r="13" fill="#FFF6E5" />
            <circle cx="62" cy="46" r="13" fill="#FFF6E5" />
            <circle cx="38" cy="46" r="6" fill="#3B2A20" />
            <circle cx="62" cy="46" r="6" fill="#3B2A20" />
            <path d="M50 52 L44 62 L56 62 Z" fill="#FFA94D" />
            <path d="M18 60 Q10 40 26 30 Q22 46 30 56 Z" fill="#6E5236" />
            <path d="M82 60 Q90 40 74 30 Q78 46 70 56 Z" fill="#6E5236" />
            {mood === "cheer" && (
              <path
                d="M40 72 Q50 82 60 72"
                stroke="#3B2A20"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </svg>
        </div>
        <div>
          <p className="nook-label">Siyafunda · Siya the Owl's reading nook</p>
          <h1>Hi there, story explorer!</h1>
        </div>
        <div className="header-rewards">
          <button className="coins-count" onClick={() => setShowBadges(true)}>
            💰 <span>{coins} coins</span>
          </button>
          <button className="badges-count" onClick={() => setShowBadges(true)}>
            🏆 <span>{badges.length} badges</span>
          </button>
          <button className="firefly-count" onClick={() => setShowJar(true)}>
            <span className="firefly-dot" />{" "}
            <span>{readIds.length} fireflies caught</span>
          </button>
          <span className="streak-count">
            <Flame size={17} fill="currentColor" /> {streak.count} day streak
          </span>
        </div>
        <button
          className="nook-settings"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Open accessibility settings"
        >
          <Settings2 size={20} />
        </button>
      </header>
      {(isReading || interimTranscript) && (
        <div className="speech-preview" aria-live="polite">
          <span>Heard:</span> {interimTranscript || "..."}
        </div>
      )}
      <main className="nook-main" id="top">
        <section className="lantern-picker">
          <p className="picker-label">Pick a story lantern</p>
          <div className="lantern-row">
            {allStories.map((item, index) => {
              const isRead = readIds.includes(item.id);
              const isSelected = selectedStoryId === item.id;
              const color = LANTERN_COLORS[item.color] || LANTERN_COLORS.teal;
              return (
                <div className="lantern-item" key={item.id}>
                  <button
                    className={`lantern-button ${isSelected ? "lantern-selected" : ""}`}
                    onClick={() => selectStory(item)}
                  >
                    <span className="lantern-string" />
                    <span
                      className="lantern-card"
                      style={{
                        background: color,
                        boxShadow: isRead
                          ? `0 0 22px 6px ${color}aa`
                          : undefined,
                        animationDelay: `${index * 0.2}s`,
                      }}
                    >
                      <LanternIcon
                        kind={
                          item.emoji ||
                          ["cloud", "frog", "fish", "sock", "dragon"][index % 5]
                        }
                        color="#FFF6E5"
                      />
                      <span>{item.title}</span>
                      <small>
                        {(item.chapters || [{ title: "Chapter 1" }]).length}{" "}
                        chapters
                      </small>
                      {isRead && <b>✓</b>}
                    </span>
                  </button>
                  {item.custom && (
                    <div className="lantern-actions">
                      <button
                        className="lantern-edit"
                        onClick={() => editStory(item)}
                        aria-label={`Edit ${item.title}`}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="lantern-delete"
                        onClick={() => removeStory(item.id)}
                        aria-label={`Delete ${item.title}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <button className="lantern-add" onClick={beginNewStory}>
              <span>+</span>
              <small>New story</small>
            </button>
          </div>
        </section>
        <section className="selected-story" key={story.id}>
          <div
            className="selected-icon"
            style={{
              background: LANTERN_COLORS[story.color] || LANTERN_COLORS.teal,
            }}
          >
            <LanternIcon kind={story.emoji || "dragon"} color="#FFF6E5" />
          </div>
          <div className="selected-copy">
            <h2>{story.title}</h2>
            <p>
              {chapters.length} chapters · {chapter.title} ·{" "}
              {readIds.includes(story.id) ? "read already" : "not read yet"}
            </p>
            <div className="chapter-list" aria-label="Choose a chapter">
              {chapters.map((item, index) => (
                <button
                  className={
                    index === chapterIndex
                      ? " chapter-button active"
                      : "chapter-button"
                  }
                  key={item.title}
                  onClick={() => selectChapter(index)}
                >
                  Chapter {index + 1}
                </button>
              ))}
            </div>
          </div>
          <button className="start-story" onClick={beginSelectedStory}>
            {readIds.includes(story.id) ? "Read again" : "Start reading"}
          </button>
        </section>
        <section
          className={`reader-dock tint-${accessibility.tint}`}
          style={{
            "--reader-font-scale": accessibility.fontSize,
            "--reader-font-family":
              STORY_FONTS[accessibility.fontFamily] || STORY_FONTS.archivo,
            "--reader-spacing": `${accessibility.spacing}em`,
            "--reader-line-height": accessibility.lineHeight,
          }}
        >
          <div className="dock-heading">
            <div>
              <span className="dock-kicker">
                {story.level} lantern · Chapter {chapterIndex + 1}
              </span>
              <strong>{progress}% glowing</strong>
            </div>
            <button onClick={resetAll} className="dock-reset">
              <RotateCcw size={15} /> Reset
            </button>
          </div>
          <div className="dock-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="story-board" aria-live="polite">
            {wordStatuses.map((item, index) => {
              const isActive =
                index === activeWordIndex && (isReading || listening);
              return (
                <button
                  className={`word ${item.status} ${isActive ? "active" : ""}`}
                  key={`${story.id}-${chapterIndex}-${index}`}
                  onClick={() => speakWord(item.text)}
                  title="Listen to word"
                >
                  {item.status === "correct" && <Check size={13} />}
                  {item.status === "incorrect" && <X size={13} />}
                  {renderWord(item.text)}
                </button>
              );
            })}
          </div>
          {(micError ||
            recognitionWarning ||
            !browserSupportsSpeechRecognition) && (
            <div className="mic-alert" role="alert">
              <MicOff size={17} />
              <span>
                {micError ||
                  recognitionWarning ||
                  "Voice reading is not supported. You can still type each word."}
              </span>
              {(micError || recognitionWarning) && (
                <button
                  onClick={() => {
                    setMicError("");
                    setRecognitionWarning("");
                  }}
                  aria-label="Dismiss microphone message"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
          {(isReading || listening) && (
            <div className="mic-meter">
              <AudioWaveform size={18} />
              <div className="meter-track">
                <span style={{ width: `${Math.max(4, micLevel)}%` }} />
              </div>
              <span>{micLevel > 8 ? "Mic active" : "Listening"}</span>
            </div>
          )}
          <div className="read-status">
            <span
              className={isReading || listening ? "pulse-dot" : "status-dot"}
            />
            {isFinished ? (
              <strong>Story complete!</strong>
            ) : (
              <span>{hesitating ? "Take your time..." : lastHeard}</span>
            )}
          </div>
          <div className="controls">
            {isReading || listening ? (
              <button className="primary-button pause" onClick={stopReading}>
                <MicOff size={19} /> Pause
              </button>
            ) : (
              <button
                className="primary-button"
                onClick={startReading}
                disabled={isFinished || !browserSupportsSpeechRecognition}
              >
                <Mic size={19} /> Start reading
              </button>
            )}
            <button
              className="secondary-button"
              onClick={() =>
                speakWord(targetWords[activeWordIndex] || story.title)
              }
            >
              <Volume2 size={18} /> Listen to word
            </button>
            {hesitating && (
              <button
                className="secondary-button retry-button"
                onClick={retryWord}
              >
                <RotateCcw size={18} /> Retry word
              </button>
            )}
            {(isReading || listening) && (
              <button
                className="secondary-button skip-button"
                onClick={skipWord}
              >
                <SkipForward size={18} /> Skip
              </button>
            )}
          </div>
          <form className="type-along" onSubmit={submitTypedWord}>
            <label htmlFor="type-word">
              No microphone? Type the word instead.
            </label>
            <div>
              <input
                id="type-word"
                value={typedWord}
                onChange={(event) => setTypedWord(event.target.value)}
                placeholder={targetWords[activeWordIndex] || "All done"}
                disabled={isFinished}
              />
              <button
                type="submit"
                aria-label="Submit word"
                disabled={isFinished}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </form>
        </section>
      </main>
      {showCelebration && (
        <div className="celebration-backdrop" role="dialog" aria-modal="true">
          <div className="celebration-card">
            <div className="celebration-sparkles">
              <Sparkles size={26} />
              <Sparkles size={20} />
              <Sparkles size={24} />
            </div>
            <div className="celebration-owl">🦉</div>
            <h2>Story lantern glowing!</h2>
            <p>
              You finished <strong>{story.title}</strong>. A firefly is waiting
              in your jar.
            </p>
            <div className="celebration-firefly">
              <span className="firefly-dot" /> +1 firefly
            </div>
            <div className="celebration-rewards">
              <div className="reward-item">
                <span>💰</span> +5-15 coins
              </div>
              {badges.length > 0 && (
                <div className="reward-item">
                  <span>🏆</span> {badges.length} badges earned
                </div>
              )}
            </div>
            <button
              className="start-story"
              onClick={() => {
                setShowCelebration(false);
                setMood("open");
              }}
            >
              Keep reading
            </button>
          </div>
        </div>
      )}
      {showJar && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="jar-card">
            <div className="settings-title">
              <div>
                <span className="eyebrow">Your trophies</span>
                <h2>Firefly jar</h2>
              </div>
              <button
                onClick={() => setShowJar(false)}
                aria-label="Close firefly jar"
              >
                <X size={18} />
              </button>
            </div>
            {readIds.length === 0 ? (
              <div className="empty-jar">
                <span>✦</span>
                <p>Finish a story to catch your first firefly.</p>
              </div>
            ) : (
              <div className="jar-list">
                {readIds.map((readId) => {
                  const finishedStory = allStories.find(
                    (item) => item.id === readId,
                  );
                  return finishedStory ? (
                    <div className="jar-story" key={readId}>
                      <span className="jar-glow">
                        <Sparkles size={17} />
                      </span>
                      <strong>{finishedStory.title}</strong>
                      <span>Glowing!</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div className="tricky-words">
              <strong>Words to practice</strong>
              {Object.entries(missedWords)
                .sort(([, first], [, second]) => second - first)
                .slice(0, 5)
                .map(([word, count]) => (
                  <span key={word}>
                    {word} <small>{count} misses</small>
                  </span>
                ))}
              {Object.keys(missedWords).length === 0 && (
                <p>No tricky words yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
      {showBadges && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="jar-card">
            <div className="settings-title">
              <div>
                <span className="eyebrow">Your achievements</span>
                <h2>Badges & Coins</h2>
              </div>
              <button
                onClick={() => setShowBadges(false)}
                aria-label="Close badges"
              >
                <X size={18} />
              </button>
            </div>
            <div className="coins-display">
              <div style={{ fontSize: "2.5em", textAlign: "center" }}>
                💰 {coins}
              </div>
              <p
                style={{ textAlign: "center", color: "#666", marginTop: "8px" }}
              >
                Coins earned from reading
              </p>
            </div>
            <div className="badges-grid">
              <strong>Badges Earned</strong>
              {badges.length === 0 ? (
                <p>Keep reading to earn badges!</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    marginTop: "12px",
                  }}
                >
                  {badges.map((badge) => (
                    <div
                      key={badge}
                      style={{
                        padding: "12px",
                        background: "#fff9e6",
                        border: "2px solid #ffd700",
                        borderRadius: "8px",
                        textAlign: "center",
                        fontSize: "0.9em",
                        fontWeight: "bold",
                      }}
                    >
                      🏆
                      <br />
                      {badge}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={generateProgressReport}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "12px",
                background: "#347c69",
                color: "#fff",
                border: "0",
                borderRadius: "8px",
                font: "700 13px 'Quicksand', sans-serif",
                cursor: "pointer",
              }}
            >
              📋 Download Progress Report
            </button>
          </div>
        </div>
      )}
      {showAddStory && (
        <div className="modal-backdrop">
          <form className="story-form" onSubmit={addStory}>
            <div className="settings-title">
              <div>
                <span className="eyebrow">Your library</span>
                <h2>{newStory.id ? "Edit story" : "Add a short story"}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStory(false)}
                aria-label="Close add story"
              >
                <X size={18} />
              </button>
            </div>
            <label htmlFor="story-title">Story title</label>
            <input
              id="story-title"
              value={newStory.title}
              onChange={(event) =>
                setNewStory({ ...newStory, title: event.target.value })
              }
              placeholder="The little green leaf"
              maxLength={60}
              required
            />
            <label htmlFor="story-level">Reading level</label>
            <select
              id="story-level"
              value={newStory.level}
              onChange={(event) =>
                setNewStory({ ...newStory, level: event.target.value })
              }
            >
              <option>Starter</option>
              <option>Growing</option>
              <option>Confident</option>
            </select>
            <div className="chapter-editor-heading">
              <label>Chapters</label>
              <button
                type="button"
                className="add-chapter-button"
                onClick={() =>
                  setNewStory({
                    ...newStory,
                    chapters: [
                      ...newStory.chapters,
                      {
                        id: `chapter-${Date.now()}`,
                        title: `Chapter ${newStory.chapters.length + 1}`,
                        text: "",
                      },
                    ],
                  })
                }
              >
                <Plus size={15} /> Add chapter
              </button>
            </div>
            <DragDropContext onDragEnd={reorderChapters}>
              <Droppable droppableId="story-chapters">
                {(provided) => (
                  <div
                    className="chapter-editor-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {newStory.chapters.map((chapterItem, index) => (
                      <Draggable
                        draggableId={chapterItem.id}
                        index={index}
                        key={chapterItem.id}
                      >
                        {(provided) => (
                          <div
                            className="chapter-editor"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <button
                              type="button"
                              className="chapter-drag-handle"
                              aria-label={`Reorder chapter ${index + 1}`}
                              title="Drag to reorder chapter"
                              {...provided.dragHandleProps}
                            >
                              <GripVertical size={16} />
                            </button>
                            <input
                              aria-label={`Chapter ${index + 1} title`}
                              value={chapterItem.title}
                              onChange={(event) =>
                                setNewStory({
                                  ...newStory,
                                  chapters: newStory.chapters.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, title: event.target.value }
                                        : item,
                                  ),
                                })
                              }
                              placeholder={`Chapter ${index + 1}`}
                            />
                            <textarea
                              aria-label={`Chapter ${index + 1} words`}
                              value={chapterItem.text}
                              onChange={(event) =>
                                setNewStory({
                                  ...newStory,
                                  chapters: newStory.chapters.map(
                                    (item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, text: event.target.value }
                                        : item,
                                  ),
                                })
                              }
                              placeholder="A little leaf falls. The wind carries it home."
                              minLength={3}
                              required={index === 0}
                            />
                            {newStory.chapters.length > 1 && (
                              <button
                                type="button"
                                className="remove-chapter-button"
                                onClick={() =>
                                  setNewStory({
                                    ...newStory,
                                    chapters: newStory.chapters.filter(
                                      (_, itemIndex) => itemIndex !== index,
                                    ),
                                  })
                                }
                                aria-label={`Remove chapter ${index + 1}`}
                              >
                                <X size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <p className="form-help">
              Each chapter needs at least three words. Empty chapters are
              skipped when saved.
            </p>
            <button className="primary-button" type="submit">
              <Plus size={18} /> {newStory.id ? "Save changes" : "Save story"}
            </button>
          </form>
        </div>
      )}
      {showSettings && (
        <div className="settings-popover accessibility-panel">
          <div className="settings-title">
            <div>
              <span className="eyebrow">Reader comfort</span>
              <strong>Accessibility</strong>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              aria-label="Close settings"
            >
              <X size={17} />
            </button>
          </div>
          <label htmlFor="rate">
            Pronunciation speed <span>{rate}x</span>
          </label>
          <input
            id="rate"
            type="range"
            min="0.5"
            max="1"
            step="0.01"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
          <label htmlFor="font-size">
            Text size <span>{accessibility.fontSize}x</span>
          </label>
          <input
            id="font-size"
            type="range"
            min="0.9"
            max="1.35"
            step="0.05"
            value={accessibility.fontSize}
            onChange={(event) =>
              setAccessibility({
                ...accessibility,
                fontSize: event.target.value,
              })
            }
          />
          <label htmlFor="font-family">Story font</label>
          <select
            id="font-family"
            value={accessibility.fontFamily}
            onChange={(event) =>
              setAccessibility({
                ...accessibility,
                fontFamily: event.target.value,
              })
            }
          >
            <option value="archivo">Archivo Black</option>
            <option value="rubik">Rubik Spray Paint</option>
            <option value="roboto">Roboto</option>
            <option value="openSans">Open Sans</option>
          </select>
          <label htmlFor="letter-spacing">
            Letter spacing <span>{accessibility.spacing}x</span>
          </label>
          <input
            id="letter-spacing"
            type="range"
            min="0.8"
            max="1.8"
            step="0.1"
            value={accessibility.spacing}
            onChange={(event) =>
              setAccessibility({
                ...accessibility,
                spacing: event.target.value,
              })
            }
          />
          <label htmlFor="line-height">
            Line height <span>{accessibility.lineHeight}</span>
          </label>
          <input
            id="line-height"
            type="range"
            min="1.2"
            max="1.9"
            step="0.05"
            value={accessibility.lineHeight}
            onChange={(event) =>
              setAccessibility({
                ...accessibility,
                lineHeight: event.target.value,
              })
            }
          />
          <label htmlFor="tint">Background tint</label>
          <select
            id="tint"
            value={accessibility.tint}
            onChange={(event) =>
              setAccessibility({ ...accessibility, tint: event.target.value })
            }
          >
            <option value="cream">Warm cream</option>
            <option value="sky">Soft blue</option>
            <option value="sage">Soft sage</option>
            <option value="plain">Plain white</option>
          </select>
          <label className="toggle-row" htmlFor="bionic">
            <input
              id="bionic"
              type="checkbox"
              checked={accessibility.bionic}
              onChange={(event) =>
                setAccessibility({
                  ...accessibility,
                  bionic: event.target.checked,
                })
              }
            />{" "}
            Bionic word focus
          </label>
          <label htmlFor="language">Learning language</label>
          <select
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          <button
            className="reset-data-button"
            type="button"
            onClick={resetUserData}
          >
            <Trash2 size={16} /> Reset user data
          </button>
        </div>
      )}
    </div>
  );
}
