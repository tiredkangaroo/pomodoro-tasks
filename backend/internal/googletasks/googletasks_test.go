package googletasks

import "testing"

func TestSortByDue(t *testing.T) {
	tasks := []Task{
		{Title: "undated a", TasklistTitle: "A", Position: "001"},
		{Title: "next week", Due: "2026-09-12T00:00:00.000Z", TasklistTitle: "A", Position: "002"},
		{Title: "overdue", Due: "2026-09-01T00:00:00.000Z", TasklistTitle: "B", Position: "003"},
		{Title: "undated b", TasklistTitle: "B", Position: "004"},
		{Title: "today, list b", Due: "2026-09-05T00:00:00.000Z", TasklistTitle: "B", Position: "001"},
		{Title: "today, list a", Due: "2026-09-05T00:00:00.000Z", TasklistTitle: "A", Position: "009"},
		{Title: "malformed due", Due: "nope", TasklistTitle: "A", Position: "000"},
	}

	sortByDue(tasks)

	want := []string{
		"overdue",
		"today, list a",
		"today, list b",
		"next week",
		// Undated (and unparseable) tasks fall to the end, ordered by
		// tasklist then manual position.
		"malformed due",
		"undated a",
		"undated b",
	}

	for i, title := range want {
		if tasks[i].Title != title {
			t.Errorf("position %d: got %q, want %q", i, tasks[i].Title, title)
		}
	}
}

func TestDueKey(t *testing.T) {
	cases := map[string]string{
		"2026-09-05T00:00:00.000Z": "2026-09-05",
		"2026-09-05":               "2026-09-05",
		"":                         noDueSentinel,
		"short":                    noDueSentinel,
	}
	for in, want := range cases {
		if got := dueKey(in); got != want {
			t.Errorf("dueKey(%q) = %q, want %q", in, got, want)
		}
	}
}
