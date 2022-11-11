docker run -d -p 80:80 karolplonka/nodejs_api:!insert_tag!; #run the container in background
sleep 5; #wait 5 seconds

if curl 127.0.0.1/user/KarolPlonka; then
    exit 0
else
    exit 1
fi
