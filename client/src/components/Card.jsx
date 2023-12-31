import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ReactAudioPlayer from "react-audio-player";
import { doc, getDoc, getFirestore, deleteDoc, updateDoc, deleteField } from "firebase/firestore"
import { auth, app } from '../firebase';
import moment from 'moment'
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { deleteObject, getStorage, ref } from 'firebase/storage';

const BookCard = () => {
  const [auds, setAuds] = useState({});
  const user = auth.currentUser.uid;
  const db = getFirestore(app);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const docref = doc(db, "Files", user);
    const dataref = await getDoc(docref);
    if (dataref.exists()) {
      setAuds(dataref.data())
    }
  };

  const sortedKeys = Object.keys(auds).sort((a, b) => {
    return new Date(auds[b].updatedOn) - new Date(auds[a].updatedOn);
  });

  const handleDelete = async (fileName) => {
      await Swal.fire({
      title: 'Delete File',
      text: 'Are you sure you want to delete this file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      showLoaderOnConfirm: true,
      preConfirm: async() => {
        try {
          const cancleBtn = Swal.getCancelButton()
          cancleBtn.style.display = "none"
          const docRef = doc(db, 'Files', user);
          const storage = getStorage();
          const audRef = ref(storage, auds[fileName].url )
          console.log(auds[fileName].url)
          await deleteObject(audRef).then( async () => {
            await updateDoc(docRef, {
              [fileName]: deleteField()
            });
            // await deleteDoc(docRef, fileName);
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success')
            .then(()=>window.location.reload());
          } )
          
          // fetchData();
        } catch (error) {
          Swal.fire('Error', 'An error occurred while deleting the file.', 'error');
        }
      }
    });
  };

  return (
    <Row xs={1} md={2} className="g-4 mt-3 mb-3">
      {sortedKeys && sortedKeys.map((aud, idx) => {
        return (
          <Col key={idx}>
            <Card>
              <Card.Header style={{ textTransform: "uppercase" }}>{aud}</Card.Header>
              <Card.Body>
                <Card.Title>Created on: {moment(auds[aud].createdOn).fromNow()}</Card.Title>
                <Card.Title>Last modified: {moment(auds[aud].updatedOn).fromNow()} </Card.Title>
                <Card.Title>Duration: {auds[aud].duration ? auds[aud].duration : ""} </Card.Title>
                <Card.Title>Comments: {auds[aud].comments ? auds[aud].comments.length : 0} </Card.Title>
                <Link to="/view" state={{
                  fileName: aud,
                  captions: auds[aud].captions ? auds[aud].captions : "",
                  url: auds[aud].url ? auds[aud].url : ""
                }}>
                  <Button variant="info">View</Button>
                </Link>
                <Button style={{marginLeft: "0.5rem" }} variant="danger" onClick={() => handleDelete(aud)}>Delete</Button>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

export default BookCard;