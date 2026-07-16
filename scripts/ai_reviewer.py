import os
import sys
import json
import subprocess
import urllib.request
import urllib.error

def run_cmd(args):
    result = subprocess.run(args, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command {' '.join(args)}: {result.stderr}")
        return ""
    return result.stdout.strip()

def main():
    # Retrieve environment variables
    github_token = os.environ.get("GITHUB_TOKEN")
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    pr_number = os.environ.get("PR_NUMBER")
    repo_name = os.environ.get("REPO_NAME")

    if not github_token:
        print("Error: GITHUB_TOKEN is not set.")
        sys.exit(1)
    if not gemini_api_key:
        print("Error: GEMINI_API_KEY is not set.")
        sys.exit(1)
    if not pr_number:
        print("Error: PR_NUMBER is not set.")
        sys.exit(1)
    if not repo_name:
        print("Error: REPO_NAME is not set.")
        sys.exit(1)

    print(f"[AI Reviewer] Starting review for PR #{pr_number} in repo {repo_name}...")

    # 1. Fetch git diff
    # Fetch origin/main branch to compare against
    run_cmd(["git", "fetch", "origin", "main"])
    diff = run_cmd(["git", "diff", "origin/main...HEAD"])

    if not diff:
        print("[AI Reviewer] No code changes detected in this PR. Skipping review.")
        sys.exit(0)

    print(f"[AI Reviewer] Extracted diff of size {len(diff)} bytes.")

    # Truncate diff if it's too large to fit in standard token limits
    if len(diff) > 80000:
        print("[AI Reviewer] Diff is very large. Truncating to the first 80,000 characters...")
        diff = diff[:80000] + "\n\n...[Diff Truncated due to size]..."

    # 2. Call Gemini API
    prompt = f"""You are an expert AI code reviewer. Below is the git diff of a pull request.
Review the diff thoroughly for logic errors, security flaws, performance bugs, and code quality issues.
Specifically check:
1. Firestore transactions (confirm runTransaction is used for updates requiring validation or reads).
2. React and TypeScript hook rules, missing useEffect dependencies, or path routing errors.
3. CSS / mobile responsiveness flaws, layout overflows, or overlapping buttons on mobile views.

Provide actionable feedback.

You must return a valid JSON object matching this structure:
{{
  "pr_comment": "Markdown formatted summary review to be posted on the PR. Keep it encouraging and structured.",
  "findings": [
    {{
      "severity": "critical",
      "title": "Short title describing the issue",
      "file": "path/to/file.tsx",
      "line": 42,
      "description": "Detailed explanation of what is wrong and why it is a bug.",
      "fix": "Code snippet illustrating the fix."
    }}
  ]
}}

Make sure "severity" is either "critical", "warning", or "suggestion". If there are no findings, return an empty array for "findings".

Pull Request Diff:
{diff}
"""

    gemini_payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_api_key}"
    
    print("[AI Reviewer] Sending request to Gemini API...")
    req = urllib.request.Request(
        gemini_url,
        data=json.dumps(gemini_payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            ai_text = res_body["candidates"][0]["content"]["parts"][0]["text"]
            review_data = json.loads(ai_text)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error calling Gemini: {e.read().decode('utf-8')}")
        sys.exit(1)
    except Exception as e:
        print(f"Error calling or parsing Gemini response: {str(e)}")
        sys.exit(1)

    print("[AI Reviewer] Successfully generated code review.")

    pr_comment = review_data.get("pr_comment", "")
    findings = review_data.get("findings", [])

    # Format findings list into the main PR comment for readability
    if findings:
        pr_comment += "\n\n### 🔍 Detailed Findings\n"
        for idx, f in enumerate(findings, 1):
            severity_emoji = "🔴" if f["severity"] == "critical" else "🟡" if f["severity"] == "warning" else "🔵"
            pr_comment += f"\n#### {severity_emoji} {idx}. {f['title']} ({f['severity'].upper()})\n"
            pr_comment += f"- **File**: `{f['file']}` (Line {f['line']})\n"
            pr_comment += f"- **Problem**: {f['description']}\n"
            if f.get("fix"):
                pr_comment += f"- **Suggested Fix**:\n```typescript\n{f['fix']}\n```\n"

    # 3. Post PR Comment
    print("[AI Reviewer] Posting review comment to PR...")
    github_comment_url = f"https://api.github.com/repos/{repo_name}/issues/{pr_number}/comments"
    comment_payload = json.dumps({"body": pr_comment}).encode("utf-8")
    
    comment_req = urllib.request.Request(
        github_comment_url,
        data=comment_payload,
        headers={
            "Authorization": f"token {github_token}",
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "AI-PR-Reviewer"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(comment_req) as res:
            print("[AI Reviewer] Posted PR review comment successfully.")
    except urllib.error.HTTPError as e:
        print(f"Error posting comment to GitHub: {e.read().decode('utf-8')}")
    except Exception as e:
        print(f"Error posting comment to GitHub: {str(e)}")

    # 4. File GitHub Issues for critical findings
    critical_findings = [f for f in findings if f["severity"] == "critical"]
    if critical_findings:
        print(f"[AI Reviewer] Found {len(critical_findings)} critical issues. Filing backlog issues...")
        for f in critical_findings:
            github_issue_url = f"https://api.github.com/repos/{repo_name}/issues"
            issue_body = f"""### File
`{f['file']}` (Line {f['line']})

### Description
{f['description']}

### Suggested Fix
```typescript
{f['fix']}
```

*Created automatically by the [AI Code Reviewer](https://github.com/ryramzy/elo-fluxa-rj/blob/main/scripts/ai_reviewer.py).*
"""
            issue_payload = json.dumps({
                "title": f"[AI Alert] {f['title']}",
                "body": issue_body,
                "labels": ["ai-review", "bug"]
            }).encode("utf-8")

            issue_req = urllib.request.Request(
                github_issue_url,
                data=issue_payload,
                headers={
                    "Authorization": f"token {github_token}",
                    "Accept": "application/vnd.github.v3+json",
                    "User-Agent": "AI-PR-Reviewer"
                },
                method="POST"
            )

            try:
                with urllib.request.urlopen(issue_req) as res:
                    res_data = json.loads(res.read().decode("utf-8"))
                    print(f"[AI Reviewer] Filed critical issue: {res_data.get('html_url')}")
            except urllib.error.HTTPError as e:
                print(f"Error filing GitHub issue for critical finding: {e.read().decode('utf-8')}")
            except Exception as e:
                print(f"Error filing GitHub issue: {str(e)}")

    print("[AI Reviewer] Review completed successfully!")

if __name__ == "__main__":
    main()
