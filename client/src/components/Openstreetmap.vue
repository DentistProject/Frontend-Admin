<template>
  <div class="container mt-5">
    <section class="map-header mb-1">
      <h3>Clinic Locations</h3>
    </section>
    <div class="container mb-3">
      <form @submit.prevent="createClinic">
        <div class="row gx-3 mb-3 text-start">
          <div class="col-md-6">
            <label class="small mb-1" for="clinicName">Clinic Name</label>
            <input class="form-control" id="clinicName" type="text" placeholder="Enter clinic name" v-model="clinicName">
          </div>
          <div class="col-md-6">
            <label class="small mb-1" for="clinicAddress">Clinic address</label>
            <input class="form-control" id="clinicAddress" type="text" placeholder="Enter clinic address"
              v-model="clinicAddress">
          </div>
        </div>
        <button class="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
    <div id="mapContainer" ref="mapContainer"></div>
    <!-- <div id="popupTemplate" ref="popupTemplate" >
  <div v-for="clinic in clinicsData" :key="clinic._id">
    <strong>Clinic Name:</strong> {{ clinic.clinicName }}<br>
    {{ clinic.location.formattedAddress }}
    <button @click="deleteClinic(clinic._id)">Delete</button>
  </div>
</div> -->

  </div>
</template>
  
<script>
import "/node_modules/mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX;

export default {
  data() {
    return {
      clinicName: "",
      clinicAddress: "",
      mapContainer: null,
      markers: [],
    };
  },
  mounted() {
    this.initializeMap();
    this.getLocation();
  },
  unmounted() {
    this.mapContainer.remove();
    this.mapContainer = null;
  },
  methods: {
    initializeMap() {
      this.mapContainer = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [11.9746, 57.7089],
        zoom: 11,
      });
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
        const response = await axios.get("http://localhost:3000/api/v1/clinics");
        this.clinicsData = response.data.clinics;

        // Clear existing markers TODO: try to dinf a better way to do this and separate the logic
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        this.clinicsData.forEach((clinic) => {
          const popupContent = this.createPopupContent(clinic);
          const marker = new mapboxgl.Marker()
            .setLngLat(clinic.location.coordinates)
            .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
            .addTo(this.mapContainer);

          this.markers.push(marker);
        });
      } catch (error) {
        console.error("Error fetching clinic data:", error);
      }
    },

    displayClinicsOnMap() {
      this.clinicsData.forEach((clinic) => {
        const popupContent = this.createPopupContent(clinic);
        new mapboxgl.Marker()
          .setLngLat(clinic.location.coordinates)
          .setPopup(new mapboxgl.Popup().setDOMContent(popupContent))
          .addTo(this.mapContainer);
      });
    },
    createPopupContent(clinic) {
      const popupContent = document.createElement("div");
      const deleteBtn = this.createDeleteButton(clinic._id);
      popupContent.innerHTML = `<strong>Clinic Name:</strong> ${clinic.clinicName}<br>${clinic.location.formattedAddress}`;
      popupContent.appendChild(deleteBtn);
      return popupContent;
    },
    createDeleteButton(clinicId) {
      const deleteBtn = document.createElement("button");
      // deleteBtn.classList.add("delete-btn"); //not needed unless i want to color the button
      deleteBtn.dataset.clinicId = clinicId;
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => this.deleteClinic(clinicId));
      return deleteBtn;
    },
    async createClinic() {
      const data = {
        clinicName: this.clinicName,
        address: this.clinicAddress,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/v1/clinics", data);
        console.log(response);
        this.getLocation();
      } catch (error) {
        console.error("Error fetching the address or duplicate name", error);
      }
    },
    async deleteClinic(clinicId) {
      try {
        await axios.delete(`http://localhost:3000/api/v1/clinics/${clinicId}`);
        console.log("Clinic deleted successfully:", clinicId);

        this.getLocation();
      } catch (error) {
        console.error("Error deleting clinic:", error);
      }
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
  