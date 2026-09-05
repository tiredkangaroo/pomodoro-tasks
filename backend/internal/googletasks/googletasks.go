// Package googletasks wraps the Google Tasks API with the small surface area
// this application actually needs.
package googletasks

import (
	"context"
	"fmt"
	"net/http"
	"sort"

	"google.golang.org/api/option"
	tasksapi "google.golang.org/api/tasks/v1"
)

// Task is the flattened shape the frontend consumes.
type Task struct {
	ID            string `json:"id"`
	TasklistID    string `json:"tasklistId"`
	TasklistTitle string `json:"tasklistTitle"`
	Title         string `json:"title"`
	Notes         string `json:"notes"`
	Due           string `json:"due,omitempty"`
	Position      string `json:"position,omitempty"`
	Parent        string `json:"parent,omitempty"`
	Updated       string `json:"updated,omitempty"`
}

// Client talks to the Google Tasks API on behalf of one authenticated user.
type Client struct {
	svc *tasksapi.Service
}

// New builds a Client from an already-authorized HTTP client.
func New(ctx context.Context, httpClient *http.Client) (*Client, error) {
	svc, err := tasksapi.NewService(ctx, option.WithHTTPClient(httpClient))
	if err != nil {
		return nil, fmt.Errorf("create tasks service: %w", err)
	}
	return &Client{svc: svc}, nil
}

// ListOpenTasks returns every non-completed task across all of the user's
// tasklists. Completed tasks are never requested, which keeps the "done"
// column scoped to the current session as required.
func (c *Client) ListOpenTasks(ctx context.Context) ([]Task, error) {
	lists, err := c.allTasklists(ctx)
	if err != nil {
		return nil, err
	}

	out := make([]Task, 0, 64)
	for _, list := range lists {
		listTasks, err := c.openTasksForList(ctx, list)
		if err != nil {
			return nil, err
		}
		out = append(out, listTasks...)
	}

	// Stable ordering: group by tasklist, then respect the user's manual
	// ordering inside each list.
	sort.SliceStable(out, func(i, j int) bool {
		if out[i].TasklistTitle != out[j].TasklistTitle {
			return out[i].TasklistTitle < out[j].TasklistTitle
		}
		return out[i].Position < out[j].Position
	})
	return out, nil
}

func (c *Client) allTasklists(ctx context.Context) ([]*tasksapi.TaskList, error) {
	var lists []*tasksapi.TaskList
	pageToken := ""
	for {
		call := c.svc.Tasklists.List().MaxResults(100).Context(ctx)
		if pageToken != "" {
			call = call.PageToken(pageToken)
		}
		resp, err := call.Do()
		if err != nil {
			return nil, fmt.Errorf("list tasklists: %w", err)
		}
		lists = append(lists, resp.Items...)
		if resp.NextPageToken == "" {
			break
		}
		pageToken = resp.NextPageToken
	}
	return lists, nil
}

func (c *Client) openTasksForList(ctx context.Context, list *tasksapi.TaskList) ([]Task, error) {
	var out []Task
	pageToken := ""
	for {
		call := c.svc.Tasks.List(list.Id).
			ShowCompleted(false).
			ShowHidden(false).
			ShowDeleted(false).
			MaxResults(100).
			Context(ctx)
		if pageToken != "" {
			call = call.PageToken(pageToken)
		}
		resp, err := call.Do()
		if err != nil {
			return nil, fmt.Errorf("list tasks for %q: %w", list.Title, err)
		}
		for _, t := range resp.Items {
			// Defensive: the API should already have filtered these out.
			if t.Status == "completed" || t.Deleted {
				continue
			}
			out = append(out, Task{
				ID:            t.Id,
				TasklistID:    list.Id,
				TasklistTitle: list.Title,
				Title:         t.Title,
				Notes:         t.Notes,
				Due:           t.Due,
				Position:      t.Position,
				Parent:        t.Parent,
				Updated:       t.Updated,
			})
		}
		if resp.NextPageToken == "" {
			break
		}
		pageToken = resp.NextPageToken
	}
	return out, nil
}

// CompleteTask marks a single task as completed in Google Tasks.
func (c *Client) CompleteTask(ctx context.Context, tasklistID, taskID string) (*Task, error) {
	patched, err := c.svc.Tasks.Patch(tasklistID, taskID, &tasksapi.Task{Status: "completed"}).Context(ctx).Do()
	if err != nil {
		return nil, fmt.Errorf("complete task %s: %w", taskID, err)
	}
	return &Task{
		ID:         patched.Id,
		TasklistID: tasklistID,
		Title:      patched.Title,
		Notes:      patched.Notes,
		Due:        patched.Due,
		Position:   patched.Position,
		Parent:     patched.Parent,
		Updated:    patched.Updated,
	}, nil
}
