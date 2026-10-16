# City geometry provenance

Source: Kenney, City Kit (Commercial), version 2.1.
https://kenney.nl/assets/city-kit-commercial
Official archive: https://kenney.nl/media/pages/assets/city-kit-commercial/a742d900eb-1753115042/kenney_city-kit-commercial_2.1.zip
License: CC0. Original License.txt retained alongside these files.

Selected GLB meshes: building-skyscraper-a, building-skyscraper-b, building-skyscraper-c, building-skyscraper-d, building-skyscraper-e, building-a, building-b, building-d, building-g, building-h, building-k, building-n.
The rooftop prototype clones/scales these twelve meshes into 96 city buildings and replaces their materials with original comic facade shaders. These are generic city assets, not Sony film production models. The hero rooftop, ledge, gargoyle, city placement, camera path and effects are original procedural work.

Shot reference is stored outside the published app at docs/art-direction/references/leap-of-faith-shot-reference.jpg. Image source: https://images.everyeye.it/img-notizie/spider-man-universo-miles-morales-supereroe-clip-v3-355338.jpg (film still, Sony Pictures/Marvel; visual reference only, not a runtime texture).

Architecture refinement: six facade families, deterministic varied placement, profile-specific source meshes, and original batched cornices, water towers, fire escapes, window frames, crowns, HVAC and signs. Rooftop equipment uses raycast support heights from the imported geometry.

The packaged `Textures/colormap.png` is included from the same licensed source archive to resolve the GLB image references. Imported materials are still replaced by the authored comic shaders.
