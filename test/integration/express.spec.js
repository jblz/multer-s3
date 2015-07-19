var express = require('express');
var app = express();
var supertest = require('supertest');
var multers3 = require('../../index');
var multer = require('multer');
var should = require('chai').should();
var AWS = require('aws-sdk')
var lastReq = lastRes = null;
var upload = multer({storage: multers3({
  dirname: 'uploads/photos',
  bucket: 'some-bucket',
  secretAccessKey: 'some secret',
  accessKeyId: 'some key',
  region: 'us-east-1',
  s3ForcePathStyle: true,
  endpoint: new AWS.Endpoint('http://localhost:4568')
})});

// express setup
app.post('/upload', upload.array('photos', 3), function(req, res, next){
  lastReq = req;
  lastRes = res;
  res.status(200).send();
});

describe('express', function(){
  it('successfully uploads a file', function(done){
    supertest(app)
      .post('/upload')
      .attach('photos', 'test/fixtures/ffffff.png')
      .expect(200, done)
  });
  it('returns a req.files with the s3 filename', function(done){
    supertest(app)
      .post('/upload')
      .attach('photos', 'test/fixtures/ffffff.png')
      .end(function(err, res){
        lastReq.files.map(function(file){
          file.should.have.property('name');
        });
        done();
      });
  });
});
