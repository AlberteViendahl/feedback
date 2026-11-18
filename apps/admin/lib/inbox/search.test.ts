import { describe, expect, it } from "vitest";
import { makeTicket } from "./test-fixtures";
import { getSearchWords, matchesSearch } from "./search";

// makeTicket defaults: #FB-1000 from Anna Holm (anna@company.dk, Company ApS, user 4821) on
// GEOtracking /overview, Chrome 130 on macOS.
const ticket = makeTicket({
  _id: "t1",
  description: "Knappen virker ikke\nDet skete i går på siden med rapporter",
  attachments: [{ kind: "image", fileName: "skaermbillede.png", sizeBytes: 1000 }],
  reply: { text: "Tak for beskeden", sentAt: 0 },
});

function matches(search: string, target = ticket) {
  return matchesSearch(target, getSearchWords(search));
}

describe("getSearchWords", () => {
  it.each([
    ["", []],
    ["   ", []],
    ["  Anna   Overview ", ["anna", "overview"]],
    ["anna\toverview\nfejl", ["anna", "overview", "fejl"]],
    ["#FB-1042", ["#fb-1042"]],
  ])("splits %j into words", (search, words) => {
    expect(getSearchWords(search)).toEqual(words);
  });
});

describe("matchesSearch", () => {
  it("matches every ticket when there are no words", () => {
    expect(matchesSearch(ticket, [])).toBe(true);
  });

  it.each([
    ["the first line of the text", "knappen"],
    ["a later line of the text", "rapporter"],
    ["the ticket number", "#fb-1000"],
    ["the bare ticket number", "1000"],
    ["the sender's name", "holm"],
    ["the sender's email", "company.dk"],
    ["the sender's company", "aps"],
    ["the platform name", "geotracking"],
    ["the page path", "/overview"],
  ])("finds %s", (_detail, search) => {
    expect(matches(search)).toBe(true);
  });

  it.each([
    ["the browser", "chrome"],
    ["the operating system", "macos"],
    ["the user ID", "4821"],
    ["an attachment's file name", "skaermbillede"],
    ["the reply", "beskeden"],
  ])("does not search %s", (_detail, search) => {
    expect(matches(search)).toBe(false);
  });

  it("ignores upper and lower case", () => {
    expect(matches("KNAPPEN Anna")).toBe(true);
  });

  it("needs every word, each anywhere in the details", () => {
    expect(matches("anna overview")).toBe(true);
    expect(matches("anna csv")).toBe(false);
  });

  it("does not let a word span two details", () => {
    // "Holm" ends the name and "anna@" starts the email.
    expect(matches("holmanna")).toBe(false);
  });

  it("matches special characters literally", () => {
    const special = makeTicket({ _id: "t2", description: "Prisen er 5 * 2 (cirka) og <b>fed</b>" });
    expect(matches("*", special)).toBe(true);
    expect(matches("(cirka)", special)).toBe(true);
    expect(matches("<b>", special)).toBe(true);
    expect(matches("*", ticket)).toBe(false);
    expect(matches("(", ticket)).toBe(false);
    expect(matches("<b>", ticket)).toBe(false);
    expect(matches("a.b", makeTicket({ _id: "t3", description: "axb" }))).toBe(false);
  });

  it("matches Danish letters regardless of case, without folding them", () => {
    const danish = makeTicket({
      _id: "t2",
      sender: { name: "Freja Mølgaard", email: "freja@moelgaard.dk", userId: "1", company: "Mølgaard Tekst", plan: "Pro" },
    });
    expect(matches("MØLGAARD", danish)).toBe(true);
    expect(matches("ø", makeTicket({ _id: "t3", description: "ØRESUND" }))).toBe(true);
    expect(matches("ø", makeTicket({ _id: "t4", description: "Kontakt freja@moelgaard.dk" }))).toBe(false);
  });

  it("finds a sender without a name by email and company", () => {
    const anonymous = makeTicket({
      _id: "t2",
      sender: { email: "kontakt@cafe-norrebro.dk", userId: "2", company: "Café Nørrebro", plan: "Basic" },
    });
    expect(matches("kontakt@cafe", anonymous)).toBe(true);
    expect(matches("nørrebro", anonymous)).toBe(true);
  });

  it("searches an unsafe page address as the text the list shows", () => {
    const unsafe = makeTicket({
      _id: "t2",
      context: { ...ticket.context, pageUrl: "javascript:alert(1)" },
    });
    expect(matches("javascript", unsafe)).toBe(true);
  });

  it("filters 1,000 tickets well within 0.2 seconds (SC-003)", () => {
    const many = Array.from({ length: 1000 }, (_, index) =>
      makeTicket({ _id: `m${index}`, number: index, description: `Feedback nummer ${index}\nmed to linjer` }),
    );
    const words = getSearchWords("anna overview");
    const start = performance.now();
    const found = many.filter((item) => matchesSearch(item, words));
    expect(performance.now() - start).toBeLessThan(200);
    expect(found).toHaveLength(1000);
  });
});
