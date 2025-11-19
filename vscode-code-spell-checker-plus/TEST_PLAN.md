Test Plan (Draft)

Objective: Verify whether the optimizations based on Code Spell Checker meet the acceptance criteria in the project plan:
- Technical term false positive rate ≤ 10%
- Top1 hit rate for correction suggestions ≥ 80%
- Correction response time ≤ 2 seconds/operation
- Support for Chinese (Pinyin) and Japanese word segmentation checking

Environment:
- Operating Systems: Windows 10/11 (PowerShell), Ubuntu, macOS
- VS Code: Latest stable version
- Node.js environment: Node >= 20 (CI environment)

Test Types and Use Case Priorities:
1. Smoke Tests (Must-do)
   - Ability to install the extension (local VSIX or debug mode)
   - Core spell checking functionality with sample files
2. Unit Tests (Automated)
   - Term dictionary loading module: successful loading, empty dictionary handling, format error handling
   - Candidate word generation: algorithm boundaries, performance testing
3. Integration Tests
   - Multi-language support: Chinese Pinyin examples, Japanese variable name examples
   - One-click correction: successful word replacement, rollback/undo support
4. Performance Tests
   - Large file scanning time and memory consumption
   - Dictionary loading time (target: fast loading)

Acceptance Criteria:
- All smoke tests pass
- Automated tests cover key modules (unit tests pass)
- CI can be triggered on PRs to run tests

Execution and Responsibilities:
- QA is responsible for smoke and integration test execution, issue recording, and regression testing;
- Development team is responsible for fixes and unit test coverage;
- Team lead is responsible for milestones, merges, and release decisions.

Recommended Next Steps:
- Configure Node 20 environment in CI and execute upstream build and tests (adjust workflow if developing directly in this repository)
- Add specific test data and sample files in `qa/sample-workspaces/`
