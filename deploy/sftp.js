/* tslint:disable */
console.log(process.argv);

const { deploy } = require('sftp-sync-deploy');

let config = {
  host: 'wycode.cn', // Required.
  port: 22, // Optional, Default to 22.
  username: 'root', // Required.
  password: process.argv[2], // Optional.
  //  privateKey: '/path/to/key.pem', // Optional.
  //  passphrase: 'passphrase',       // Optional.
  //  agent: '/path/to/agent.sock',   // Optional, path to the ssh-agent socket.
  localDir: 'dist/chat-angular', // Required, Absolute or relative to cwd.
  remoteDir: '/var/www/chat/' // Required, Absolute path only.
};

let options = {
  dryRun: false, // Enable dry-run mode. Default to false
  excludeMode: 'remove', // Behavior for excluded files ('remove' or 'ignore'), Default to 'remove'.
  forceUpload: false // Force uploading all files, Default to false(upload only newer files).
};

deploy(config, options)
  .then(() => {
    console.log('sftp upload success!');
  })
  .catch(err => {
    console.error('sftp upload error! ', err);
  });
