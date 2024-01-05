<template>
  <div class="container mt-5">
    <!-- This is the clinic registration part -->
    <div class=" mb-4">
      <div class="card">
        <div class="card-body text-white mailbox-widget pb-0" style="background-color: #567890;">
          <h4 class="text-white pb-3">Clinic Registration</h4>
        </div>
      </div>
    </div>
    <div class="container mb-3">
      <form @submit.prevent="createClinic">
        <div class="row gx-3 mb-3 text-start">
          <div class="col-md-6">
            <label class="small mb-1" for="clinicName">Clinic Name</label>
            <input class="form-control" id="clinicName" type="text" placeholder="Enter clinic name" v-model="clinicName"
              @input="resetResponseMessage">
          </div>
          <div class="col-md-6">
            <label class="small mb-1" for="clinicAddress">Clinic address</label>
            <input class="form-control" id="clinicAddress" type="text" placeholder="Enter clinic address"
              v-model="clinicAddress">
          </div>
          <div class="col-md-6">
            <label class="small mb-1" for="clinicEmail">Email</label>
            <input class="form-control" id="clinicEmail" type="text" placeholder="Enter clinic email"
              v-model="clinicEmail">
          </div>
          <div class="col-md-6">
            <label class="small mb-1" for="clinicPassword">Password</label>
            <input class="form-control" id="clinicPassword" type="text" placeholder="Generate secure password"
              v-model="clinicPassword" :disabled="true">
            <button style="width: 100%;" @click.prevent="generateRandomPassword(16)">Generate Password</button>
          </div>
        </div>
        <button class="btn btn-primary" type="submit">Register</button>
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="responseMessage" class="text-success">{{ responseMessage }}</p>
      </form>
    </div>
    <!-- This is the bookings part -->
    <div class=" mb-4">
      <div class="card">
        <div class="card-body text-white mailbox-widget pb-0" style="background-color: #567890;">
          <h4 class="text-white pb-3">Clinic Locations</h4>
        </div>
        <!-- Conditional Form -->
        <div v-if="showForm">
          <h3>Reason for Visit</h3>
          <form @submit.prevent="confirmBooking">
            <label for="reason">Enter reason for visit:</label>
            <textarea class="form-control" id="reason" v-model="visitReason"></textarea>

            <button type="submit" class="btn btn-primary">Confirm</button>
            <button type="button" class="btn btn-secondary" @click="cancelForm">Cancel</button>
          </form>
        </div>
      </div>
    </div>
    <div v-if="bookings.length > 0" class="row">
      <div class="col-md-12">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Dentist</th>
              <th>Date</th>
              <th>Time</th>
              <th>Message</th>
              <th>Status</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking._id">
              <td>{{ booking.patientName }}</td>
              <td>{{ booking.dentistName }}</td>
              <td>{{ booking.date }}</td>
              <td>{{ booking.time }}</td>
              <td>{{ booking.message }}</td>
              <td>{{ booking.status }}</td>
              <td> <button class="btn btn-primary" @click="cancelAndReOpenBooking(booking)">Re-Open</button>
              </td>
              <td> <button class="btn btn-danger" @click="cancelBooking(booking)">Cancel</button> </td>
              <td> <button class="btn btn-success" @click="openForm(booking)">BOOK</button> </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div id="mapContainer" ref="mapContainer"></div>
  </div>
</template>

<script>
import axios from "axios";
const API_GATEWAY = import.meta.env.VITE_API_GATEWAY;

import "/node_modules/mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX;

export default {
  data() {
    return {
      bookings: [],
      clinicName: "",
      clinicAddress: "",
      clinicEmail: "",
      clinicPassword: "",
      mapContainer: null,
      clinicsData: [],
      markers: [],
      error: null,
      responseMessage: null,
      visitReason: '', // To store the reason for the visit
      bookingToConfirm: null, // To store the booking data
      showForm: false,
    };
  },
  mounted() {
    this.initializeMap();
    this.getLocation();
    this.setPatientId();
  },
  unmounted() {
    if (this.mapContainer) {
      this.mapContainer.remove();
      this.mapContainer = null;
    }
  },
  methods: {
    setPatientId() {
      localStorage.setItem('patientId', 'dab594ad-ae32-406f-a5ac-ce103476ef58');
      localStorage.setItem('first_name', 'John');
      localStorage.setItem('last_name', 'Doe');
    },
    confirmBooking() {
      if (this.visitReason.trim() !== '') {
        // Handle your confirmation logic here


        const patientName = localStorage.getItem('first_name') + ' ' + localStorage.getItem('last_name');
        axios.patch(`http://${API_GATEWAY}:80/api/v1/bookings/${this.bookingToConfirm._id}`, {
          status: 'BOOKED',
          patientName: this.patientName,
          message: this.visitReason,
        })
          .then(() => {
            this.getAllBookings();
          })
          .catch((error) => {
            console.error(error);
          });

        console.log('Booking confirmed with reason:', this.visitReason);

        // Reset and hide the form
        this.showForm = false;
        this.visitReason = '';

      } else {
        // Show an error message or handle empty reason case
        console.log('Please provide a reason for the visit.');
      }
    },
    openForm(booking) {
      this.bookingToConfirm = booking;
      this.visitReason = '';
      this.showForm = true;
    },
    cancelForm() {
      // Reset and hide the form
      this.showForm = false;
      this.visitReason = '';
    },

    initializeMap() {
      this.mapContainer = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [11.9746, 57.7089],
        zoom: 10,
      });
      this.mapContainer.addControl(new mapboxgl.FullscreenControl()); // full screen control
      this.mapContainer.addControl(new mapboxgl.NavigationControl()); // zoom in/out control
      this.mapContainer.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );
    },
    async getLocation() {
      try {
        const response = await axios.get(`http://${API_GATEWAY}:80/api/v1/clinics`);
        this.clinicsData = response.data.clinics;
        console.log(response.data.clinics)

        this.clearMarkers();
        this.displayClinicsOnMap();
      } catch (error) {
        console.error("Error fetching clinic data:", error);
      }
    },
    clearMarkers() {
      this.markers.forEach((marker) => marker.remove());
      this.markers = [];
    },
    displayClinicsOnMap() {
      this.clinicsData.forEach((clinic) => {
        const popupContent = this.createPopupContent(clinic);
        const marker = new mapboxgl.Marker()
          .setLngLat(clinic.location.coordinates)
          .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
          .addTo(this.mapContainer);

        // Add click event listener to the marker
        marker.getElement().addEventListener('click', () => {
          this.showClinicInformation(clinic);
        });

        this.markers.push(marker);
      });
    },

    showClinicInformation(clinic) {
      const clinicId = clinic._id;
      localStorage.setItem('dentistId', clinic.dentistId);
      console.log(localStorage.getItem('dentistId'));
      localStorage.setItem('dentistName', clinic.dentistName);

      axios.get(`http://${API_GATEWAY}:80/api/v1/bookings/dentist/available/${clinic.dentistId}`)
        .then(response => {
          const clinicInfo = response.data;
          console.log('Clinic Information:', clinicInfo);

          // Use a temporary variable for better code readability
          const updatedBookings = clinicInfo;

          // Update the state property
          this.bookings = updatedBookings;
        })
        .catch(error => {
          console.error('Error fetching clinic information:', error);
        });
    },

    createPopupContent(clinic) {
      const popupContent = document.createElement("div");
      const editBtn = this.createEditButton(clinic);
      const deleteBtn = this.createDeleteButton(clinic._id);

      popupContent.innerHTML = `<strong>Clinic Name:</strong> ${clinic.clinicName}<br>${clinic.location.formattedAddress}`;
      popupContent.appendChild(document.createTextNode(' '));
      popupContent.appendChild(editBtn);
      popupContent.appendChild(document.createTextNode(' '));
      popupContent.appendChild(deleteBtn);

      return popupContent;
    },
    createEditButton(clinic) {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => this.editClinic(clinic));
      return editBtn;
    },
    createDeleteButton(clinicId) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => this.deleteClinic(clinicId));
      return deleteBtn;
    },
    async editClinic(clinic) {
      let newClinicName = prompt("Enter the new clinic name:", clinic.clinicName);
      let newAddress = prompt("Enter the new address:", clinic.location.formattedAddress);

      // ensur values are not null or empty strings
      newClinicName = newClinicName ? newClinicName.trim() : clinic.clinicName;
      newAddress = newAddress ? newAddress.trim() : clinic.location.formattedAddress;

      const updatedClinic_postgres = {
        name: newClinicName,
        location: newAddress,
      };

      try {
        const dentistToPatch = localStorage.getItem('dentistId');
        console.log('Updating dentist from postgres: ', dentistToPatch);
        await axios.patch(`http://${API_GATEWAY}:80/api/v1/dentists/${dentistToPatch}/`, updatedClinic_postgres);
        console.log("Clinic updated successfully:", dentistToPatch);
      } catch (error) {
        console.error("Error updating clinic:", error);
      }

      const updatedClinic = {
        clinicName: newClinicName,
        address: newAddress,
      };

      try {
        await axios.patch(`http://${API_GATEWAY}:80/api/v1/clinics/${clinic._id}`, updatedClinic);
        console.log("Clinic updated successfully:", clinic._id);
        this.getLocation();
      } catch (error) {
        console.error("Error updating clinic:", error);
      }
    },
    async createClinic() {
      console.log(this.clinicsData);
      if (!this.clinicName || !this.clinicAddress || !this.clinicEmail || !this.clinicPassword) {
        this.error = "Please enter all fields.";
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.clinicEmail)) {
        this.error = "Please enter a valid email address.";
        return;
      }
      if (this.clinicsData.some(clinic => clinic.clinicName === this.clinicName)) {
        this.error = "Clinic name already exists.";
        return;
      }
      if (this.clinicsData.some(clinic => clinic.clinicEmail === this.clinicEmail)) {
        this.error = "Clinic email already exists.";
        return;
      }

      /**
      if (this.clinicsData.some(
        clinic => clinic.location.formattedAddress === this.clinicAddress)) {
        this.error = "Clinic address already exists.";
      }
       */

      const data_postgres = {
        name: this.clinicName,
        email: this.clinicEmail,
        password: this.clinicPassword,
        location: this.clinicAddress,
      };
      try {
        const response = await axios.post(`http://${API_GATEWAY}:80/api/v1/dentists/`, data_postgres);
        console.log(response.data);
        console.log(response.data.data.id);
        var clinicId = response.data.data.id;

        this.responseMessage = response.data.message;
        this.error = null;

      } catch (error) {
        console.error("Error creating clinic:", error);
        this.error = "An error occurred while creating the clinic.";
      }

      const data = {
        clinicName: this.clinicName,
        clinicEmail: this.clinicEmail,
        dentistId: clinicId,
        address: this.clinicAddress,
      };

      try {
        const response = await axios.post(`http://${API_GATEWAY}:80/api/v1/clinics`, data);
        console.log(response);
        const duplicateAddress = this.clinicsData.some(
          clinic => clinic.location.formattedAddress === response.data.clinic.location.formattedAddress
        )
        console.log(duplicateAddress);
        if (duplicateAddress) {
          this.error = "Clinic address already exists.";
          this.deleteClinic(response.data.clinic._id);
        }

        this.getLocation();
      } catch (error) {
        console.error("Error creating clinic:", error);
        this.error = "An error occurred while creating the clinic.";
      }
    },
    async deleteClinic(clinicId) {
      try {
        const dentistToDelete = localStorage.getItem('dentistId');
        console.log('Deleting this dentist from postgres: ', dentistToDelete);
        await axios.delete(`http://${API_GATEWAY}:80/api/v1/dentists/${dentistToDelete}/`);
        console.log("Clinic deleted successfully:", dentistToDelete);
      } catch (error) {
        console.error("Error deleting clinic:", error);
      }
      try {
        await axios.delete(`http://${API_GATEWAY}:80/api/v1/clinics/${clinicId}`);
        console.log("Clinic deleted successfully:", clinicId);
        this.getLocation();
      } catch (error) {
        console.error("Error deleting clinic:", error);
      }
    },
    generateRandomPassword(length) {
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
      let password = "";
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
      }
      this.clinicPassword = password;
    },
    openPostModal() {
      this.showPostModal = true;
    },
    closePostModal() {
      this.showPostModal = false;
    },
    openSuccessModal() {
      this.showSuccessModal = true;
    },
    closeSuccessModal() {
      this.showSuccessModal = false;
    },
    submitPost() {
      const dentistID = localStorage.getItem('dentistID');
      const dentistName = localStorage.getItem('dentistName');
      this.newBooking.dentistID = dentistID;
      this.newBooking.dentistName = dentistName;
      axios.post(`http://${API_GATEWAY}:80/api/v1/bookings/`, {
        patientName: '',
        dentistName: this.newBooking.dentistName,
        dentistID: this.newBooking.dentistID,
        date: this.newBooking.date,
        time: this.newBooking.time,
        status: 'AVAILABLE'
      }).then(() => {
        this.showPostModal = false;
        this.openSuccessModal();
        this.getAllBookings();
      })
        .catch((error) => {
          console.error(error);
        });
    },
    getAllBookings() {
      let dentistID = localStorage.getItem('dentistID');
      axios.get(`http://${API_GATEWAY}:80/api/v1/bookings/dentist/${dentistID}`)
        .then((response) => {
          this.bookings = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    cancelAndReOpenBooking(booking) {
      console.log(booking)
      console.log(this.dentistName)
      axios.patch(`http://${API_GATEWAY}:80/api/v1/bookings/${booking._id}`, {
        status: 'CANCELED'

      })
        .then(() => {
          axios.post(`http://${API_GATEWAY}:80/api/v1/bookings/`, {
            patientName: '',
            dentistName: booking.dentistName,
            dentistID: booking.dentistID,
            date: booking.date,
            time: booking.time,
            status: 'AVAILABLE'
          })
            .then(() => {
              this.getAllBookings();
            })


        })
        .catch((error) => {
          console.error(error);
        });
    },
    cancelBooking(booking) {
      console.log(booking)
      console.log(this.dentistName)
      axios.patch(`http://${API_GATEWAY}:80/api/v1/bookings/${booking._id}`, {
        status: 'CANCELED'
      })
        .then(() => {
          this.getAllBookings();
        })
        .catch((error) => {
          console.error(error);
        });

    },
    resetResponseMessage() {
      this.responseMessage = null;
    },
  },
};
</script>

<style scoped>
#mapContainer {
  display: flex;
  height: 600px;
  width: 100%;
  padding: 0;
  flex: 1;
}

.map-header {
  background-color: rgb(211, 222, 222);
  padding: 0.5rem;
  border-radius: 0.25rem;
}
</style>

