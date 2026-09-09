#!/usr/bin/env bash
set -euo pipefail
# Uses a fresh, disposable database inside the already-running isolated test container.
db_name="blueprintbid_test_$(date +%s)"
docker exec blueprintbid-test-db createdb -U postgres "$db_name"
for sql in tests/database/bootstrap.sql supabase/migrations/*.sql tests/database/isolation.sql tests/database/aggregate.sql; do
  docker exec -i blueprintbid-test-db psql -U postgres -d "$db_name" -v ON_ERROR_STOP=1 -v base_project="$(cat fixtures/demo-project.json)" -v estimate_cases="$(cat fixtures/estimate-cases.json)" < "$sql"
done
