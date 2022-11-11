docker run -d -p 80:80 karolplonka/nodejs_api:!insert_tag!; #run the container in background
sleep 5; #wait 5 seconds
curl 127.0.0.1/user/KarolPlonka; #test the get requset 
curl 156.12.352.1;