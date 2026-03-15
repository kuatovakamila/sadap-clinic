"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FRAME_COUNT = 240;
const FPS = 60;

const SEQUENCES = {
  "12": "/images2/12",
  "22": "/images2/22",
  "32": "/images2/32",
};

const QUIZ_OPTIONS = ["Онлайн запись", "Список врачей", "Контакты"];

const SERVICE_OPTIONS = [
  "Диагностика",
  "Консультации",
  "Хирургическое лечение",
  "Анализы",
  "Услуги стационара",
  "Процедурный кабинет",
  "Комплексные программы",
  "Услуги на дому",
  "Вакцинация",
  "Экстренная хирургия",
  "Скорая помощь",
  "Лекарства",
];

const SHOWCASE_DOCTORS = [
  {
    id: "zarina",
    fullName: "Юламанова Зарина Евгеньевна",
    specialty: "Врач-педиатр",
    rating: "4.9",
    avatar: "/doctor-female.jpg",
  },
  {
    id: "perizat",
    fullName: "Жунисова Перизат Мухитдиновна",
    specialty: "Акушер-гинеколог",
    rating: "4.5",
    avatar: "/doctor-female.jpg",
  },
];

const GLASS_PANEL_CLASS =
  "w-[min(1120px,94vw)] max-h-[calc(100vh-8.5rem)] overflow-y-auto rounded-[32px] border border-white/35 bg-white/14 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-[20px] sm:p-8";

const OVERLAY_SHELL_CLASS =
  "absolute inset-x-0 bottom-3 top-20 z-30 flex items-center justify-center px-3 sm:bottom-6 sm:px-6";

const GLASS_CARD_CLASS =
  "rounded-[24px] border border-white/30 bg-white/12 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-[20px]";

const ACTION_BUTTON_CLASS =
  "rounded-2xl px-5 py-3 text-sm font-semibold transition duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-45";

const formatFrame = (index) => String(index).padStart(3, "0");

const buildSequenceUrls = (sequenceId) => {
  const folder = SEQUENCES[sequenceId];

  return Array.from({ length: FRAME_COUNT }, (_, index) => {
    const frame = formatFrame(index + 1);
    return `${folder}/ezgif-frame-${frame}.webp`;
  });
};

const getProgressByStage = (stage) => {
  switch (stage) {
    case "quiz1":
      return 25;
    case "lounge":
      return 75;
    case "approach":
      return 88;
    case "doctorShowcase":
      return 100;
    default:
      return 40;
  }
};

export default function ExperiencePage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const imageCacheRef = useRef({ "12": [], "22": [], "32": [] });
  const loadingPromiseRef = useRef({});
  const currentImageRef = useRef(null);
  const frameIndexRef = useRef({ "12": 0, "22": 0, "32": 0 });

  const [isBootLoading, setIsBootLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [stage, setStage] = useState("quiz1");
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");

  const drawImageToCanvas = useCallback((image) => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, width, height);

    const imageWidth = image.naturalWidth || image.width;
    const imageHeight = image.naturalHeight || image.height;

    const scale = Math.max(width / imageWidth, height / imageHeight);
    const drawWidth = imageWidth * scale;
    const drawHeight = imageHeight * scale;
    const offsetX = (width - drawWidth) / 2;
    const offsetY = (height - drawHeight) / 2;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    currentImageRef.current = image;
  }, []);

  const preloadSequence = useCallback(async (sequenceId, onProgress) => {
    if (imageCacheRef.current[sequenceId]?.length === FRAME_COUNT) {
      return imageCacheRef.current[sequenceId];
    }

    if (loadingPromiseRef.current[sequenceId]) {
      return loadingPromiseRef.current[sequenceId];
    }

    const urls = buildSequenceUrls(sequenceId);

    const loadPromise = (async () => {
      const loadedImages = [];

      for (let index = 0; index < urls.length; index += 1) {
        const image = new window.Image();

        await new Promise((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error(`Не удалось загрузить кадр: ${urls[index]}`));
          image.src = urls[index];
        });

        loadedImages.push(image);

        if (onProgress) {
          onProgress(Math.round(((index + 1) / urls.length) * 100));
        }
      }

      imageCacheRef.current[sequenceId] = loadedImages;
      return loadedImages;
    })();

    loadingPromiseRef.current[sequenceId] = loadPromise;

    try {
      const result = await loadPromise;
      return result;
    } finally {
      delete loadingPromiseRef.current[sequenceId];
    }
  }, []);

  const drawFrameByIndex = useCallback(
    (sequenceId, frameIndex) => {
      const images = imageCacheRef.current[sequenceId] || [];
      if (!images.length) return;

      const safeIndex = Math.max(0, Math.min(images.length - 1, frameIndex));
      drawImageToCanvas(images[safeIndex]);
      frameIndexRef.current[sequenceId] = safeIndex;
    },
    [drawImageToCanvas]
  );

  const playSequence = useCallback(
    ({ sequenceId, direction = "forward", fromIndex, toIndex, onComplete }) => {
      const images = imageCacheRef.current[sequenceId] || [];
      if (!images.length) {
        onComplete?.();
        return;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const frameDuration = 1000 / FPS;
      const startIndex =
        typeof fromIndex === "number"
          ? Math.max(0, Math.min(images.length - 1, fromIndex))
          : frameIndexRef.current[sequenceId] ?? (direction === "forward" ? 0 : images.length - 1);

      const endIndex =
        typeof toIndex === "number"
          ? Math.max(0, Math.min(images.length - 1, toIndex))
          : direction === "forward"
            ? images.length - 1
            : 0;

      const totalFrames = Math.abs(endIndex - startIndex);

      if (totalFrames === 0) {
        drawFrameByIndex(sequenceId, endIndex);
        onComplete?.();
        return;
      }

      let start = null;

      const animate = (timestamp) => {
        if (!start) start = timestamp;

        const elapsed = timestamp - start;
        const progressedFrames = Math.min(totalFrames, Math.floor(elapsed / frameDuration));
        const frameIndex =
          direction === "forward"
            ? startIndex + progressedFrames
            : startIndex - progressedFrames;

        drawFrameByIndex(sequenceId, frameIndex);

        if (progressedFrames < totalFrames) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        rafRef.current = null;
        onComplete?.();
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [drawFrameByIndex]
  );

  const playForwardToLounge = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      if (!imageCacheRef.current["22"].length) {
        await preloadSequence("22");
      }

      playSequence({
        sequenceId: "12",
        direction: "forward",
        fromIndex: frameIndexRef.current["12"],
        toIndex: FRAME_COUNT - 1,
        onComplete: () => {
          playSequence({
            sequenceId: "22",
            direction: "forward",
            fromIndex: 0,
            toIndex: FRAME_COUNT - 1,
            onComplete: () => {
              setIsAnimating(false);
              setStage("lounge");
            },
          });
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Не удалось запустить сцену");
    }
  }, [playSequence, preloadSequence]);

  const playForwardToApproach = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      if (!imageCacheRef.current["32"].length) {
        await preloadSequence("32");
      }

      playSequence({
        sequenceId: "32",
        direction: "forward",
        fromIndex: 0,
        toIndex: FRAME_COUNT - 1,
        onComplete: () => {
          setIsAnimating(false);
          setStage("approach");
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Не удалось загрузить сцену");
    }
  }, [playSequence, preloadSequence]);

  const playBackToQuizFromLounge = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      playSequence({
        sequenceId: "22",
        direction: "reverse",
        fromIndex: frameIndexRef.current["22"],
        toIndex: 0,
        onComplete: () => {
          setIsAnimating(false);
          setStage("quiz1");
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Ошибка возврата");
    }
  }, [playSequence]);

  const playBackToLoungeFromApproach = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      playSequence({
        sequenceId: "32",
        direction: "reverse",
        fromIndex: frameIndexRef.current["32"],
        toIndex: 0,
        onComplete: () => {
          drawFrameByIndex("22", FRAME_COUNT - 1);
          setIsAnimating(false);
          setStage("lounge");
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Ошибка возврата");
    }
  }, [drawFrameByIndex, playSequence]);

  const playToBookingSplit = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      playSequence({
        sequenceId: "32",
        direction: "reverse",
        fromIndex: frameIndexRef.current["32"],
        toIndex: 0,
        onComplete: () => {
          playSequence({
            sequenceId: "22",
            direction: "reverse",
            fromIndex: frameIndexRef.current["22"],
            toIndex: 0,
            onComplete: () => {
              setIsAnimating(false);
              setStage("bookingSplit");
            },
          });
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Не удалось открыть быструю запись");
    }
  }, [playSequence]);

  const playFromBookingSplitToApproach = useCallback(async () => {
    try {
      setErrorMessage("");
      setIsAnimating(true);

      playSequence({
        sequenceId: "22",
        direction: "forward",
        fromIndex: frameIndexRef.current["22"],
        toIndex: FRAME_COUNT - 1,
        onComplete: () => {
          playSequence({
            sequenceId: "32",
            direction: "forward",
            fromIndex: 0,
            toIndex: FRAME_COUNT - 1,
            onComplete: () => {
              setIsAnimating(false);
              setStage("approach");
            },
          });
        },
      });
    } catch (error) {
      setIsAnimating(false);
      setErrorMessage(error.message || "Не удалось вернуться к выбору");
    }
  }, [playSequence]);

  const handleStartJourney = async () => {
    if (!selectedChoices.length) return;

    const onlyContactsSelected =
      selectedChoices.length === 1 && selectedChoices.includes("Контакты");

    if (onlyContactsSelected) {
      router.push("/contacts");
      return;
    }

    await playForwardToLounge();
  };

  const handleBack = useCallback(async () => {
    if (isAnimating || isBootLoading) return;

    if (stage === "quiz1") {
      router.push("/");
      return;
    }

    if (stage === "lounge") {
      await playBackToQuizFromLounge();
      return;
    }

    if (stage === "bookingSplit") {
      await playFromBookingSplitToApproach();
      return;
    }

    if (stage === "approach") {
      await playBackToLoungeFromApproach();
      return;
    }

    if (stage === "doctorShowcase") {
      setStage("approach");
    }
  }, [isAnimating, isBootLoading, playBackToLoungeFromApproach, playBackToQuizFromLounge, playFromBookingSplitToApproach, router, stage]);

  const toggleChoice = (choice) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choice)) {
        return prev.filter((item) => item !== choice);
      }

      return [...prev, choice];
    });
  };

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((item) => item !== service);
      }

      return [...prev, service];
    });
  };

  const handleBookingSubmit = (event) => {
    event.preventDefault();
    router.push("/appointments/book");
  };

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const images = await preloadSequence("12", (progress) => {
          if (mounted) {
            setBootProgress(progress);
          }
        });

        if (mounted && images.length) {
          drawFrameByIndex("12", 0);
          setIsBootLoading(false);
          setStage("quiz1");
        }

        preloadSequence("22").catch(() => null);
        preloadSequence("32").catch(() => null);
      } catch (error) {
        if (mounted) {
          setErrorMessage(error.message || "Ошибка загрузки сцены");
          setIsBootLoading(false);
        }
      }
    };

    boot();

    return () => {
      mounted = false;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [drawFrameByIndex, preloadSequence]);

  useEffect(() => {
    const onResize = () => {
      if (currentImageRef.current) {
        drawImageToCanvas(currentImageRef.current);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [drawImageToCanvas]);

  const stageProgress = getProgressByStage(stage);
  const canProceedFromLounge = selectedServices.length > 0;

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/60" />

      <header className="absolute left-0 right-0 top-0 z-40 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-[20px]">
          <button
            type="button"
            onClick={handleBack}
            disabled={isAnimating || isBootLoading}
            className="pointer-events-auto text-sm font-medium tracking-wide text-white/90 transition hover:text-white disabled:opacity-45"
          >
            Назад
          </button>
          <div className="w-44 rounded-full bg-white/20 p-1">
            <div
              className="h-1.5 rounded-full bg-white transition-all duration-500"
              style={{ width: `${stageProgress}%` }}
            />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isBootLoading && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white text-[#0b3364]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
          >
            <Image src="/logo.png" alt="Sadap Clinic" width={220} height={64} priority />
            <div className="w-[min(420px,82vw)]">
              <div className="mb-3 flex items-center justify-between text-sm font-medium">
                <span>Загрузка опыта</span>
                <span>{bootProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#0b3364] transition-all duration-200"
                  style={{ width: `${bootProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "quiz1" && !isBootLoading && !isAnimating && (
          <div className={OVERLAY_SHELL_CLASS}>
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35 }}
              className={GLASS_PANEL_CLASS}
            >
              <h1 className="mb-6 text-center text-2xl font-semibold leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-3xl">
                Что для вас наиболее важно?
              </h1>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {QUIZ_OPTIONS.map((option) => {
                  const active = selectedChoices.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleChoice(option)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                        active
                          ? "border-cyan-200 bg-cyan-300/25 text-white"
                          : "border-white/30 bg-white/12 text-white hover:bg-white/18"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!selectedChoices.length}
                onClick={handleStartJourney}
                className={`${ACTION_BUTTON_CLASS} mt-6 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200`}
              >
                Далее
              </button>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "lounge" && !isAnimating && (
          <div className={OVERLAY_SHELL_CLASS}>
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              transition={{ duration: 0.32 }}
              className={GLASS_PANEL_CLASS}
            >
              <h2 className="mx-auto mb-6 max-w-4xl text-center text-lg font-semibold leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] sm:text-3xl">
                Добро пожаловать в нашу клинику. Как мы можем вам помочь?
              </h2>

              <div className="mx-auto grid max-w-5xl grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                {SERVICE_OPTIONS.map((service) => {
                  const active = selectedServices.includes(service);

                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => toggleService(service)}
                      className={`min-h-16 rounded-2xl border px-3 py-3 text-left text-xs font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] transition duration-200 hover:scale-[1.01] active:scale-[0.99] sm:text-sm ${
                        active
                          ? "border-cyan-200 bg-cyan-300/25 text-white"
                          : "border-white/30 bg-white/10 text-white hover:bg-white/15"
                      }`}
                    >
                      {service}
                    </button>
                  );
                })}
              </div>

              <div className={`${GLASS_CARD_CLASS} mx-auto mt-6 max-w-5xl p-4 sm:p-5`}>
                <h3 className="mb-2 text-base font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-lg">Наши контакты</h3>
                <p className="text-sm font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">+7 (727) 000-00-00</p>
                <p className="mb-4 text-sm font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">г. Алматы, ул. Садовая 12</p>
                <button
                  type="button"
                  onClick={() => router.push("/contacts")}
                  className={`${ACTION_BUTTON_CLASS} border border-white/50 bg-white/8 text-xs uppercase tracking-wider text-white hover:bg-white/16`}
                >
                  Перейти к контактам
                </button>
              </div>

              <button
                type="button"
                onClick={playForwardToApproach}
                disabled={!canProceedFromLounge}
                className={`${ACTION_BUTTON_CLASS} mx-auto mt-6 flex w-full max-w-5xl items-center justify-center bg-cyan-300 text-slate-950 hover:bg-cyan-200`}
              >
                Далее
              </button>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "approach" && !isAnimating && (
          <div className={OVERLAY_SHELL_CLASS}>
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36 }}
              className={GLASS_PANEL_CLASS}
            >
              <h2 className="mb-6 text-center text-lg font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-3xl">
                Выберите следующий шаг
              </h2>

              <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
                <article className={`${GLASS_CARD_CLASS} p-5`}>
                  <h3 className="mb-2 text-xl font-semibold">Быстрая запись без звонков</h3>
                  <p className="mb-4 text-sm text-white/85">
                    Оставьте данные, и мы переведем вас в мгновенную онлайн-запись.
                  </p>
                  <button
                    type="button"
                    onClick={playToBookingSplit}
                    className={`${ACTION_BUTTON_CLASS} w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200`}
                  >
                    Открыть быструю запись
                  </button>
                </article>

                <article className={`${GLASS_CARD_CLASS} p-5`}>
                  <h3 className="mb-2 text-xl font-semibold">Подобрать врача под ваш запрос</h3>
                  <p className="mb-4 text-sm text-white/85">
                    Покажем лучших специалистов по вашему запросу и выбранным услугам.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStage("doctorShowcase")}
                    className={`${ACTION_BUTTON_CLASS} w-full border border-cyan-200/50 bg-white/8 text-cyan-100 hover:bg-cyan-200/15`}
                  >
                    Подобрать врача
                  </button>
                </article>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "bookingSplit" && !isAnimating && (
          <div className={OVERLAY_SHELL_CLASS}>
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.3 }}
              className={GLASS_PANEL_CLASS}
            >
              <h2 className="mb-6 text-center text-lg font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-3xl">
                Быстрая запись у входа в клинику
              </h2>

              <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
                <article className={`${GLASS_CARD_CLASS} p-5`}>
                  <h3 className="mb-2 text-xl font-semibold text-white">Наши контакты</h3>
                  <p className="text-sm text-white/90">+7 (727) 000-00-00</p>
                  <p className="text-sm text-white/90">+7 (701) 000-00-00</p>
                  <p className="mt-3 text-sm text-white/90">г. Алматы, ул. Садовая 12</p>
                  <button
                    type="button"
                    onClick={() => router.push("/contacts")}
                    className={`${ACTION_BUTTON_CLASS} mt-5 border border-white/45 bg-white/8 text-white hover:bg-white/16`}
                  >
                    Перейти к контактам
                  </button>
                </article>

                <article className={`${GLASS_CARD_CLASS} p-5`}>
                  <h3 className="mb-2 text-xl font-semibold text-white">Быстрая запись</h3>
                  <p className="mb-4 text-sm text-white/85">Оставьте имя и телефон, и мы сразу переведем вас в форму записи.</p>
                  <form className="space-y-3" onSubmit={handleBookingSubmit}>
                    <input
                      type="text"
                      value={bookingName}
                      onChange={(event) => setBookingName(event.target.value)}
                      placeholder="Ваше имя"
                      className="w-full rounded-xl border border-white/25 bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/55"
                      required
                    />
                    <input
                      type="tel"
                      value={bookingPhone}
                      onChange={(event) => setBookingPhone(event.target.value)}
                      placeholder="Телефон"
                      className="w-full rounded-xl border border-white/25 bg-black/20 px-3 py-3 text-sm text-white placeholder:text-white/55"
                      required
                    />
                    <button
                      type="submit"
                      className={`${ACTION_BUTTON_CLASS} w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200`}
                    >
                      Перейти к записи
                    </button>
                  </form>
                </article>
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "doctorShowcase" && !isAnimating && (
          <div className={OVERLAY_SHELL_CLASS}>
            <motion.section
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 22 }}
              transition={{ duration: 0.32 }}
              className={GLASS_PANEL_CLASS}
            >
              <h2 className="mb-6 text-center text-lg font-semibold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)] sm:text-3xl">
                Рекомендованные врачи
              </h2>

              <div className="mx-auto max-h-[55vh] max-w-5xl space-y-3 overflow-y-auto pr-1">
                {SHOWCASE_DOCTORS.map((doctor) => (
                  <article
                    key={doctor.id}
                    className={`${GLASS_CARD_CLASS} flex flex-col gap-4 p-4 text-white sm:flex-row sm:items-center sm:justify-between`}
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={doctor.avatar}
                        alt={doctor.fullName}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-white sm:text-base">{doctor.fullName}</h3>
                        <p className="text-xs text-white/75 sm:text-sm">{doctor.specialty}</p>
                        <p className="mt-1 text-sm font-semibold text-amber-500">★ {doctor.rating}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/appointments/book")}
                      className={`${ACTION_BUTTON_CLASS} bg-[#0b3364] text-white hover:bg-[#0c3d78]`}
                    >
                      Записаться
                    </button>
                  </article>
                ))}
              </div>
            </motion.section>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {Boolean(errorMessage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-6 z-40 flex justify-center px-4"
          >
            <div className="rounded-2xl border border-white/25 bg-slate-900/85 px-6 py-4 text-sm font-medium text-white backdrop-blur-md">
              {errorMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
