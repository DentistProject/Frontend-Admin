<template>
  <div class="container mt-5">
    <section class="map-header mb-1">
      <h3>Clinic Locations</h3>
    </section>
    <div class="container mb-3">
      <form @submit.prevent="handleSubmit">
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
  </div>
</template>
  
<script>
import "/node_modules/mapbox-gl/dist/mapbox-gl.css"; 
import mapboxgl from "mapbox-gl";
import axios from "axios";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX;
// console.log( import.meta.env.VITE_MAPBOX)
export default {
  data() {
    return {
      mapContainer: null,
      clinicsData: [],
    };
  },
  mounted() {
    const mapContainer = new mapboxgl.Map({
      container: this.$refs.mapContainer,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [11.9746, 57.7089],
      zoom: 11,
    });

    this.mapContainer = mapContainer;

    this.currentLocation();
    this.getLocation();
  },
  unmounted() {
    this.mapContainer.remove();
    this.mapContainer = null;
  },
  methods: {
    async getLocation() {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/clinics');
        this.clinicsData = response.data.clinics;

        this.clinicsData.forEach((clinic) => {
          const popupContent = `<strong>Clinic Name:</strong> ${clinic.clinicName}<br>${clinic.location.formattedAddress}`;
          new mapboxgl.Marker()
            .setLngLat(clinic.location.coordinates)
            .setPopup(new mapboxgl.Popup().setHTML(popupContent))
            .addTo(this.mapContainer);
        });
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      }
    },
    currentLocation() {
      // this.mapContainer.addControl(new mapboxgl.FullscreenControl());
      this.mapContainer.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        })
      );
    },
    async handleSubmit() {
      const data = {
        clinicName: this.clinicName,
        address: this.clinicAddress
      }
      try {
        const response = await axios.post('http://localhost:3000/api/v1/clinics', data)
        console.log(response)
        this.getLocation();
      } catch (error) {
        console.error('Error fetching the adress or duplicate name', error);
      }
    }
  }
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
  