while true; do
    echo "Starting Bun..."
    bun run src/server/index.ts --watch
    
    if [ $? -ne 0 ]; then
        echo "Bun crashed with exit code $?. Restarting in 5 seconds..."
        sleep 5
    else
        echo "Bun exited normally. Stopping the script."
        break
    fi
done