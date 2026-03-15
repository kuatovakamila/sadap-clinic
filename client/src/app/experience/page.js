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
  const [blockingMessage, setBlockingMessage] = useState("");
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
      setBlockingMessage("");
      setStage("transitionToLounge");

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
              setStage("lounge");
            },
          });
        },
      });
    } catch (error) {
      setBlockingMessage(error.message || "Не удалось запустить сцену");
    }
  }, [playSequence, preloadSequence]);

  const playForwardToApproach = useCallback(async () => {
    try {
      setBlockingMessage("");
      setStage("transitionToApproach");

      if (!imageCacheRef.current["32"].length) {
        await preloadSequence("32");
      }

      playSequence({
        sequenceId: "32",
        direction: "forward",
        fromIndex: 0,
        toIndex: FRAME_COUNT - 1,
        onComplete: () => {
          setStage("approach");
        },
      });
    } catch (error) {
      setBlockingMessage(error.message || "Не удалось загрузить сцену");
    }
  }, [playSequence, preloadSequence]);

  const rewindCurrentScene = useCallback(
    async (sequenceId, onDone, message) => {
      try {
        setBlockingMessage(message || "Возвращаемся назад...");

        if (!imageCacheRef.current[sequenceId].length) {
          await preloadSequence(sequenceId);
        }

        playSequence({
          sequenceId,
          direction: "reverse",
          fromIndex: frameIndexRef.current[sequenceId],
          toIndex: 0,
          onComplete: () => {
            onDone?.();
          },
        });
      } catch (error) {
        setBlockingMessage(error.message || "Ошибка возврата");
      }
    },
    [playSequence, preloadSequence]
  );

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
    if (blockingMessage) return;

    if (stage === "quiz1") {
      router.push("/");
      return;
    }

    if (stage === "lounge") {
      setStage("rewindToQuiz");
      await rewindCurrentScene("22", () => {
        setStage("quiz1");
      });
      return;
    }

    if (stage === "approach") {
      setStage("rewindToLounge");
      await rewindCurrentScene("32", () => {
        setStage("lounge");
        drawFrameByIndex("22", FRAME_COUNT - 1);
      });
      return;
    }

    if (stage === "doctorShowcase") {
      setStage("rewindToApproach");
      await rewindCurrentScene("32", () => {
        setStage("approach");
      });
    }
  }, [blockingMessage, drawFrameByIndex, rewindCurrentScene, router, stage]);

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
          setBlockingMessage(error.message || "Ошибка загрузки сцены");
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
  const isPureAnimationStage =
    stage === "transitionToLounge" ||
    stage === "transitionToApproach" ||
    stage === "rewindToQuiz" ||
    stage === "rewindToLounge" ||
    stage === "rewindToApproach";

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/60" />

      {!isPureAnimationStage && (
        <header className="absolute left-0 right-0 top-0 z-40 px-4 pt-4 sm:px-8 sm:pt-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
            <button
              type="button"
              onClick={handleBack}
              className="pointer-events-auto text-sm font-medium tracking-wide text-white/90 transition hover:text-white"
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
      )}

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
        {stage === "quiz1" && !isBootLoading && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-x-0 bottom-10 z-30 mx-auto w-[min(760px,92vw)] rounded-3xl border border-white/20 bg-slate-950/70 p-5 shadow-2xl backdrop-blur-xl sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-white/30 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/85 transition hover:bg-white/10"
              >
                Назад
              </button>
              <div className="h-1.5 w-40 rounded-full bg-white/15">
                <div className="h-full w-1/4 rounded-full bg-cyan-300" />
              </div>
            </div>

            <h1 className="mb-6 text-center text-2xl font-semibold leading-tight text-white sm:text-3xl">
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
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "border-cyan-300 bg-cyan-300/20 text-cyan-100"
                        : "border-white/25 bg-white/5 text-white/85 hover:bg-white/12"
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
              className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Далее
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "lounge" && !blockingMessage && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.32 }}
            className="absolute inset-x-0 bottom-3 top-20 z-30 mx-auto w-[min(1120px,96vw)] overflow-y-auto rounded-3xl border border-white/35 bg-white/16 p-4 backdrop-blur-2xl sm:bottom-6 sm:p-7"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.55)] sm:text-2xl">
                Добро пожаловать в нашу клинику. Как мы можем вам помочь?
              </h2>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-white/35 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10"
              >
                Назад
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              {SERVICE_OPTIONS.map((service) => {
                const active = selectedServices.includes(service);

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`min-h-16 rounded-2xl border px-3 py-3 text-left text-xs font-semibold drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] transition sm:text-sm ${
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

            <div className="mt-5 rounded-2xl border border-white/30 bg-white/12 p-4 sm:p-5">
              <h3 className="mb-2 text-base font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)] sm:text-lg">Наши контакты</h3>
              <p className="text-sm font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">+7 (727) 000-00-00</p>
              <p className="mb-4 text-sm font-medium text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">г. Алматы, ул. Садовая 12</p>
              <button
                type="button"
                onClick={() => router.push("/contacts")}
                className="rounded-xl border border-white/50 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/16"
              >
                Перейти к контактам
              </button>
            </div>

            <button
              type="button"
              onClick={playForwardToApproach}
              disabled={!canProceedFromLounge}
              className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
            >
              Далее
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "approach" && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            className="absolute inset-x-0 bottom-5 top-24 z-30 mx-auto w-[min(1040px,95vw)] overflow-y-auto rounded-3xl border border-white/20 bg-slate-950/80 p-4 backdrop-blur-xl sm:p-8"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-2xl">Выберите следующий шаг</h2>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-white/35 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/90 transition hover:bg-white/10"
              >
                Назад
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-3xl border border-cyan-100/35 bg-gradient-to-br from-cyan-400/20 via-cyan-300/10 to-white/5 p-5">
                <h3 className="mb-2 text-xl font-semibold">Быстрая запись без звонков</h3>
                <p className="mb-4 text-sm text-white/85">
                  Оставьте данные, и мы переведем вас в мгновенную онлайн-запись.
                </p>
                <form className="space-y-3" onSubmit={handleBookingSubmit}>
                  <input
                    type="text"
                    value={bookingName}
                    onChange={(event) => setBookingName(event.target.value)}
                    placeholder="Ваше имя"
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/55"
                    required
                  />
                  <input
                    type="tel"
                    value={bookingPhone}
                    onChange={(event) => setBookingPhone(event.target.value)}
                    placeholder="Телефон"
                    className="w-full rounded-xl border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/55"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Перейти к записи
                  </button>
                </form>
              </article>

              <article className="rounded-3xl border border-white/20 bg-white/5 p-5">
                <h3 className="mb-2 text-xl font-semibold">Подобрать врача под ваш запрос</h3>
                <p className="mb-4 text-sm text-white/85">
                  Покажем лучших специалистов по вашему запросу и выбранным услугам.
                </p>
                <button
                  type="button"
                  onClick={() => setStage("doctorShowcase")}
                  className="w-full rounded-xl border border-cyan-200/50 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-200/15"
                >
                  Подобрать врача
                </button>
              </article>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "doctorShowcase" && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 22 }}
            transition={{ duration: 0.32 }}
            className="absolute inset-x-0 bottom-5 top-24 z-30 mx-auto w-[min(980px,95vw)] overflow-hidden rounded-3xl border border-white/30 bg-white/95 p-4 text-slate-900 shadow-[0_18px_60px_rgba(2,12,27,0.3)] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold sm:text-2xl">Рекомендованные врачи</h2>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
              >
                Назад
              </button>
            </div>

            <div className="max-h-[calc(100%-54px)] space-y-3 overflow-y-auto pr-1">
              {SHOWCASE_DOCTORS.map((doctor) => (
                <article
                  key={doctor.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_20px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between"
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
                      <h3 className="text-sm font-semibold text-slate-900 sm:text-base">{doctor.fullName}</h3>
                      <p className="text-xs text-slate-500 sm:text-sm">{doctor.specialty}</p>
                      <p className="mt-1 text-sm font-semibold text-amber-500">★ {doctor.rating}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/appointments/book")}
                    className="rounded-xl bg-[#0b3364] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0c3d78]"
                  >
                    Записаться
                  </button>
                </article>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {Boolean(blockingMessage) && !isPureAnimationStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/35"
          >
            <div className="rounded-2xl border border-white/25 bg-slate-900/85 px-6 py-4 text-sm font-medium backdrop-blur-md">
              {blockingMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
