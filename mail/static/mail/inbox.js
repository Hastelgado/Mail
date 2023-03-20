document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email
  document.querySelector('#compose-form').onsubmit = function() {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector('#compose-recipients').value,
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    });
    return false;
    };

  // Hear for click on single email

  //doument.querySelectorAll('.emailbtns').forEach((button) => {
      //button.onclick = () => {
        //console.log("hi");
      //};
  //});


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'flex';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetch the given mailbox
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Making Divs for each email
      emails.forEach((email) => {
        const div = document.createElement('div');
        div.setAttribute("class", "emailinfo");

        // Announcing inbox and archive archive/unarchive buttons
        const archbtn = document.createElement('button');
        const unarchbtn = document.createElement('button');

        // Creating archive buttons for the inbox and archive mailboxes if accessed
        if (mailbox=="inbox"){
          archbtn.setAttribute("class", "archivebtns");
          archbtn.innerHTML="Archive";
        } else if (mailbox=="archive"){
          unarchbtn.setAttribute("class", "unarchivebtns");
          unarchbtn.innerHTML="Unarchive";
        }

        // Writing HTML of each email and adding it
        let html = `
        <button class="emailbtns" id="${email.id}">
          <span>Sender:  ${email.sender}</span>
          <span>Subject:  ${email.subject}</span>
          <span>Time:  ${email.timestamp}</span>
        </button>
        `;
        div.innerHTML = html;

        // Marking emails as read or unread
        if (email.read === false){
          div.style.backgroundColor = "white";
        } else{
          div.style.backgroundColor = "grey";
        }

        //Hear click for every element created individually without having to use .forEach()
        div.addEventListener('click', function() {
          // Log email info
          console.log(email)

          // Load email into the view
          load_mail(email);
        });


        //Check if mailbox loaded is inbox or archive to add the eventlisteners
        if (mailbox=="inbox"){ 
          archbtn.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: true
              })
            })
            .then( ()=>{
              load_mailbox("inbox");
            })
          })
        } else if (mailbox=="archive"){
          unarchbtn.addEventListener('click', function() {
            fetch(`/emails/${email.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                  archived: false
              })
            })
            .then( ()=>{
              load_mailbox("inbox");
            })
          })
        }

        //Append all new elements
        document.querySelector('#emails-view').appendChild(div);
        if (mailbox=="inbox"){ 
          document.querySelector('#emails-view').appendChild(archbtn);
        } else if (mailbox=="archive"){
          document.querySelector('#emails-view').appendChild(unarchbtn);
        }

      });

  });

};


function load_mail(email){
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // Mark email as read
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });

  //Fetch email
  document.querySelector('#email-view').innerHTML='';

  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      // Create Element and reply button
      const div = document.createElement('div');
      div.setAttribute("id", "emailview");

      const button = document.createElement('button');
      button.setAttribute("id", "replybtn");

      // Writing HTML of each email and reply button
      let html = `
        <span>Sender:  ${email.sender}</span>
        <span>Recipients:  ${email.recipients}</span>
        <span>Subject:  ${email.subject}</span>
        <span>Time:  ${email.timestamp}</span>
        <span>Body:  ${email.body}</span>
      `;
      div.innerHTML = html;
      button.innerHTML = "Reply";

      //Hear for reply click
      button.addEventListener('click', function() {

        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        if (email.subject.startsWith("Re: ")){
          document.querySelector('#compose-subject').value = `${email.subject}`;
        }else{
          document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        }
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:
${email.body}`;
      });

      //Appending elements
      document.querySelector('#email-view').appendChild(div);
      document.querySelector('#email-view').appendChild(button);
  });
};