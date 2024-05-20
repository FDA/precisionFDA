GSRS_PORT=8080

job_name="Reindex all core entities from backup tables"

job=$(
  curl -s localhost:$GSRS_PORT/api/v1/scheduledjobs -H "AUTHENTICATION_HEADER_NAME: admin" |
  jq ".content[] | select(.description==\"$job_name\")"
)

if [ -z "$job" ]; then
  echo "ERROR: can't find the job with description: $job_name"
  exit 1
fi

job_id=`echo $job | jq '.["@execute"]' | sed 's/.*\/scheduledjobs(\([^)]*\)).*/\1/'`
job_url="localhost:$GSRS_PORT/api/v1/scheduledjobs($job_id)?view=full"
job_execute_url="localhost:$GSRS_PORT/api/v1/scheduledjobs($job_id)/@execute"

echo "Run the job via $job_execute_url"
run_result=$(curl -s "$job_execute_url" -H "AUTHENTICATION_HEADER_NAME: admin")

echo "Waiting for the job to be finished..."

sleep 3

while true ; do
  job=$(curl -s -H "AUTHENTICATION_HEADER_NAME: admin" $job_url)
  is_running=`echo $job | jq '.running'`

  if [[ $is_running == "false" ]] ; then
    break
  fi

  task_message=`echo $job | jq '.taskDetails.message'`
  echo "$task_message"

  sleep 10
done