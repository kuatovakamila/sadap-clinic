"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const INTEREST_CONTENT = {
  "Онлайн запись": {
    title: "Быстрая запись без звонков",
    text: "Выберите удобное время онлайн — подтверждение приходит мгновенно в личный кабинет.",
    ctaLabel: "Перейти к онлайн-записи",
    ctaHref: "/appointments/book",
  },
  "Список врачей": {
    title: "Подбор врача под ваш запрос",
    text: "Покажем специалистов с актуальным расписанием и подходящей специализацией.",
    ctaLabel: "Открыть список врачей",
    ctaHref: "/doctors",
  },
  "Контакты": {
    title: "Контакты и навигация",
    text: "г. Алматы, ул. Садовая 12. Ежедневно с 08:00 до 20:00. Поможем быстро найти клинику.",
    ctaLabel: "Показать контакты",
    ctaHref: "/aboutUs",
  },
};

const SPECIALTY_HINTS = {
  "Онлайн запись": ["терап", "педиатр", "невр"],
  "Список врачей": ["кардио", "эндокрин", "хирург"],
  "Контакты": ["терап", "гинек", "семейн"],
};

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
    case "playing12":
      return 50;
    case "post12":
      return 62;
    case "playing22":
      return 75;
    case "lounge":
      return 82;
    case "playing32":
      return 88;
    case "doctors":
      return 100;
    default:
      return 25;
  }
};

export default function ExperiencePage() {
  const router = useRouter();
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const imageCacheRef = useRef({ "12": [], "22": [], "32": [] });
  const loadingPromiseRef = useRef({});
  const currentImageRef = useRef(null);

  const [isBootLoading, setIsBootLoading] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [blockingMessage, setBlockingMessage] = useState("");
  const [stage, setStage] = useState("quiz1");
  const [selectedChoices, setSelectedChoices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");

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

  const playSequence = useCallback(
    (sequenceId, onComplete) => {
      const images = imageCacheRef.current[sequenceId] || [];
      if (!images.length) {
        onComplete?.();
        return;
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      const frameDuration = 1000 / FPS;
      let start = null;

      const animate = (timestamp) => {
        if (!start) start = timestamp;

        const elapsed = timestamp - start;
        const frameIndex = Math.min(
          images.length - 1,
          Math.floor(elapsed / frameDuration)
        );

        drawImageToCanvas(images[frameIndex]);

        if (frameIndex < images.length - 1) {
          rafRef.current = requestAnimationFrame(animate);
          return;
        }

        rafRef.current = null;
        onComplete?.();
      };

      rafRef.current = requestAnimationFrame(animate);
    },
    [drawImageToCanvas]
  );

  const getRecommendedDoctors = useMemo(() => {
    if (!Array.isArray(doctors)) return [];

    const loweredChoices = selectedChoices.map((choice) => choice.toLowerCase());

    const scored = doctors.map((doctor) => {
      const title = String(doctor.specialization_title || "").toLowerCase();
      let score = 0;

      loweredChoices.forEach((choice) => {
        const hints = SPECIALTY_HINTS[choice] || [];
        if (hints.some((hint) => title.includes(hint))) {
          score += 3;
        }
      });

      if (!loweredChoices.length) {
        score += 1;
      }

      return { doctor, score };
    });

    return scored
      .sort((first, second) => second.score - first.score)
      .map((item) => item.doctor)
      .slice(0, 6);
  }, [doctors, selectedChoices]);

  const fetchDoctors = useCallback(async () => {
    try {
      setDoctorsLoading(true);
      setDoctorsError("");

      const response = await fetch("/api/doctors");
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Не удалось получить список врачей");
      }

      setDoctors(result.doctors || []);
    } catch (error) {
      setDoctorsError(error.message || "Ошибка загрузки врачей");
    } finally {
      setDoctorsLoading(false);
    }
  }, []);

  const startSequence22Flow = useCallback(async () => {
    try {
      setBlockingMessage("Подготавливаем зону ожидания...");

      if (!imageCacheRef.current["22"].length) {
        await preloadSequence("22");
      }

      setBlockingMessage("");
      setStage("playing22");

      playSequence("22", () => {
        setStage("lounge");
      });
    } catch (error) {
      setBlockingMessage(error.message || "Не удалось загрузить сцену");
    }
  }, [playSequence, preloadSequence]);

  const startSequence32Flow = useCallback(async () => {
    try {
      setBlockingMessage("Подготавливаем кабинет врача...");

      if (!imageCacheRef.current["32"].length) {
        await preloadSequence("32");
      }

      setBlockingMessage("");
      setStage("playing32");

      playSequence("32", async () => {
        setStage("doctors");
        await fetchDoctors();
      });
    } catch (error) {
      setBlockingMessage(error.message || "Не удалось запустить сцену");
    }
  }, [fetchDoctors, playSequence, preloadSequence]);

  const handleStartJourney = async () => {
    setStage("playing12");

    playSequence("12", async () => {
      setStage("post12");
    });
  };

  const toggleChoice = (choice) => {
    setSelectedChoices((prev) => {
      if (prev.includes(choice)) {
        return prev.filter((item) => item !== choice);
      }

      return [...prev, choice];
    });
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
          drawImageToCanvas(images[0]);
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
  }, [drawImageToCanvas, preloadSequence]);

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

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black text-white">
      <canvas ref={canvasRef} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/60" />

      <header className="absolute left-0 right-0 top-0 z-40 px-4 pt-4 sm:px-8 sm:pt-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="pointer-events-auto text-sm font-medium tracking-wide text-white/90 transition hover:text-white"
          >
            Вернуться
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
                onClick={() => router.push("/")}
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
        {stage === "post12" && !blockingMessage && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-x-0 bottom-8 z-30 mx-auto w-[min(680px,92vw)] rounded-3xl border border-white/20 bg-slate-950/70 p-5 text-center backdrop-blur-xl sm:p-8"
          >
            <p className="mb-3 text-sm uppercase tracking-[0.2em] text-white/60">Фаза 2 завершена</p>
            <h2 className="mb-3 text-2xl font-semibold">Добро пожаловать в клинику</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-relaxed text-white/80">
              Мы учли ваши предпочтения. Переходим в зону ожидания, где покажем персональные действия.
            </p>
            <button
              type="button"
              onClick={startSequence22Flow}
              className="w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Продолжить
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
            className="absolute inset-x-0 bottom-6 z-30 mx-auto w-[min(920px,94vw)] rounded-3xl border border-white/20 bg-slate-900/70 p-5 backdrop-blur-xl sm:p-8"
          >
            <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Ваш персональный сценарий в Sadap Clinic</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(selectedChoices.length ? selectedChoices : QUIZ_OPTIONS.slice(0, 1)).map((choice) => {
                const block = INTEREST_CONTENT[choice];
                if (!block) return null;

                return (
                  <article key={choice} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <h3 className="mb-2 text-base font-semibold">{block.title}</h3>
                    <p className="mb-4 text-sm leading-relaxed text-white/80">{block.text}</p>
                    <button
                      type="button"
                      onClick={() => router.push(block.ctaHref)}
                      className="rounded-xl border border-white/30 px-4 py-2 text-xs uppercase tracking-wider text-white/90 transition hover:bg-white/10"
                    >
                      {block.ctaLabel}
                    </button>
                  </article>
                );
              })}
            </div>

            <button
              type="button"
              onClick={startSequence32Flow}
              className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              К подбору врачей
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stage === "doctors" && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            className="absolute inset-x-0 bottom-4 z-30 mx-auto w-[min(1040px,96vw)] rounded-3xl border border-white/20 bg-slate-950/80 p-5 backdrop-blur-xl sm:p-8"
          >
            <h2 className="mb-2 text-2xl font-semibold">Рекомендованные врачи</h2>
            <p className="mb-5 text-sm text-white/75">
              Подбор сформирован на основе ваших приоритетов в интерактивном сценарии.
            </p>

            {doctorsLoading && <p className="text-sm text-white/80">Загружаем список врачей...</p>}
            {doctorsError && <p className="text-sm text-rose-300">{doctorsError}</p>}

            {!doctorsLoading && !doctorsError && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {getRecommendedDoctors.map((doctor) => (
                  <article key={doctor.id} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <img
                        src={doctor.avatar_url || "/doctor-female.jpg"}
                        alt={doctor.full_name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-semibold leading-tight">{doctor.full_name}</h3>
                        <p className="text-xs text-white/70">{doctor.specialization_title}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push(`/doctors/${doctor.slug}`)}
                      className="w-full rounded-xl border border-cyan-200/50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cyan-100 transition hover:bg-cyan-200/15"
                    >
                      Подробнее
                    </button>
                  </article>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {Boolean(blockingMessage) && (
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
