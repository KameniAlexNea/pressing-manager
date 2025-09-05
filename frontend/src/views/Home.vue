<template>
  <a-space direction="vertical" style="width:100%">
    <a-row :gutter="16">
      <a-col :span="8"><router-link to="/register"><a-button type="primary" block>Enregistrer un article</a-button></router-link></a-col>
      <a-col :span="8"><router-link to="/item"><a-button block>Voir un article</a-button></router-link></a-col>
      <a-col :span="8"><router-link to="/pending"><a-button type="default" block>Articles en attente</a-button></router-link></a-col>
      <a-col :span="8"><router-link to="/owner"><a-button type="dashed" block>Articles par propriétaire</a-button></router-link></a-col>
      <a-col :span="8"><router-link to="/deadlines"><a-button type="primary" danger block>Gérer les délais</a-button></router-link></a-col>
      <a-col :span="8"><router-link to="/stats"><a-button type="default" block>Statistiques</a-button></router-link></a-col>
    </a-row>
  </a-space>
</template>

<script setup lang="ts"></script>
