const express = require('express');

const app = express();

app.get('/', (req,res)=>{
    res.send("Application deployed successfully into Amazon EKS");
});

app.listen(3000,()=>{
    console.log("Server Started");
});
