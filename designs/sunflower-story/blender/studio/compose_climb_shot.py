"""Assemble the rigged benchmark shot in the editable studio Blender project."""
import bpy,os,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'blender','sunflower-studio.blend'))
scene=bpy.data.scenes.get('STUDIO 04 Climb');bpy.context.window.scene=scene;scene.name='BENCHMARK Rigged wall climb';scene.frame_end=193;scene.render.fps=24
with bpy.data.libraries.load(os.path.join(ROOT,'blender','wall-climber-rig.blend'),link=False) as (source,target):target.collections=['WallClimbCharacter']
collection=target.collections[0];scene.collection.children.link(collection)
placement=bpy.data.objects.new('Hero stage placement',None);scene.collection.objects.link(placement);placement.location=(2.06,-.3,.94);placement.rotation_euler=(-math.pi/2,0,0)
for o in list(collection.objects):
 if o.parent is None:o.parent=placement
image=bpy.data.images.load(os.path.join(ROOT,'assets','studio','climb-clean.png'),check_existing=True);image.pack()
for obj in scene.objects:
 if obj.name=='climb painted depth stage':
  for material in obj.data.materials:
   for node in material.node_tree.nodes:
    if node.bl_idname=='ShaderNodeTexImage':node.image=image
camera=scene.camera;camera.animation_data_clear()
for frame,t in [(1,0),(97,.5),(193,1)]:
 scene.frame_set(frame);camera.location=((t-.5)*.12,(t-.5)*.46,8-t*.14);camera.rotation_euler=(Vector((0,0,.1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.rotation_euler.rotate_axis('Z',(t-.5)*.022);camera.keyframe_insert(data_path='location');camera.keyframe_insert(data_path='rotation_euler')
for name,position,color,energy,size in [('Amber illustrated key',(4,4,5),(1,.57,.27),450,4),('Cool ink fill',(-3,1,4),(.25,.42,1),160,3)]:
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.size=size;obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=position;obj.rotation_euler=(Vector((2,0,.8))-obj.location).to_track_quat('-Z','Y').to_euler()
scene['character_source']='wall-climber-rig.blend';scene['web_asset']='assets/hero/wall-climber.glb';scene['text_cues']='ONE STEP at 0; THEN at 0.35; THE NEXT at 0.62; KEEP GOING at 0.80.'
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100;scene.cycles.samples=8;scene.cycles.use_denoising=True
for frame,label in [(1,'start'),(97,'reach'),(193,'end')]:
 scene.frame_set(frame);scene.render.filepath=os.path.join(ROOT,'qa','climb',f'shot-{label}-blender.png');bpy.ops.render.render(write_still=True);print('SHOT_PREVIEW',label,flush=True)
scene.frame_set(97);bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','wall-climb-benchmark.blend'))
print('BENCHMARK_SOURCE_COMPLETE',flush=True)
