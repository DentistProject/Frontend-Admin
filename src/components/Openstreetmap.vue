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
        <p v-if="error" class="text-danger">{{ error }}</p>
      </form>
    </div>
    <div id="mapContainer" ref="mapContainer"></div>
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
      clinicsData: [],
      markers: [],
      error: null,
    };
  },
  mounted() {
    this.initializeMap();
    this.getLocation();
  },
  unmounted() {
    if (this.mapContainer) {
      this.mapContainer.remove();
      this.mapContainer = null;
    }
  },
  methods: {
    initializeMap() {
      this.mapContainer = new mapboxgl.Map({
        container: this.$refs.mapContainer,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [11.9746, 57.7089],
        zoom: 10,
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
        this.markers.push(marker);
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

      const updatedClinic = {
        clinicName: newClinicName,
        address: newAddress,
      };

      try {
        await axios.patch(`http://localhost:3000/api/v1/clinics/${clinic._id}`, updatedClinic);
        console.log("Clinic updated successfully:", clinic._id);
        this.getLocation();
      } catch (error) {
        console.error("Error updating clinic:", error);
      }
    },
    async createClinic() {
      if (!this.clinicName || !this.clinicAddress) {
        this.error = "Please enter both clinic name and address.";
        return;
      }
      if (this.clinicsData.some(clinic => clinic.clinicName === this.clinicName)) {
        this.error = "Clinic name already exists.";
        return;
      }
      const data = {
        clinicName: this.clinicName,
        address: this.clinicAddress,
      };
      try {
        const response = await axios.post("http://localhost:3000/api/v1/clinics", data);
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

