export function dayPart(t) {
  const hour = new Date().getHours();
  if (hour < 12) {
    return t ? t("greeting.morning") : "Good morning";
  }
  if (hour < 17) {
    return t ? t("greeting.afternoon") : "Good afternoon";
  }
  return t ? t("greeting.evening") : "Good evening";
}

export function welcomeLine(name, detail, t) {
  const who = name || (t ? t("greeting.welcome").toLowerCase() : "there");
  const greeting = dayPart(t);
  return detail ? `${greeting}, ${who} — ${detail}` : `${greeting}, ${who}`;
}
