"""Editable 2.5D camera-projection sets for the studio art pass.
The detailed artwork is a generated matte plate; geometry provides bounded depth motion.
Earlier fully modeled prototype sets remain in the saved project.
"""
import bpy,os,math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'blender','sunflower-story.blend'))
NEUTRAL=8; FOV=36; H=2*NEUTRAL*math.tan(math.radians(FOV/2)); ASPECT=1672/941; W=H*ASPECT
NAMES=['bedroom','street','graffiti','climb','night']
def clamp(x):return min(1,max(0,x))
def smooth(x):x=clamp(x);return x*x*(3-2*x)
def g(u,v,x,y,sx,sy):return math.exp(-((u-x)**2/sx**2+(v-y)**2/sy**2))
def depth(name,u,v):
 floor=smooth((.48-v)/.48)
 if name=='bedroom':return .1+.5*floor+.22*g(u,v,.2,.45,.35,.4)+.15*g(u,v,.75,.38,.2,.32)
 if name=='street':return .06+.72*floor+.12*(abs(u-.5)*2)**2
 if name=='graffiti':return .18+.52*floor+.2*g(u,v,.18,.2,.3,.22)
 if name=='climb':return .2+.32*(1-u)+.14*g(u,v,.72,.5,.12,.35)
 return .03+.66*floor+.28*g(u,v,.11,.64,.16,.4)
for number,name in enumerate(NAMES):
 scene=bpy.data.scenes.new(f'STUDIO {number+1:02d} {name.title()}');bpy.context.window.scene=scene
 scene.render.engine='CYCLES';scene.cycles.samples=4;scene.cycles.use_denoising=False
 scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100
 scene.render.image_settings.file_format='PNG';scene.render.fps=24;scene.frame_end=240;scene.view_settings.view_transform='Standard'
 scene.world=bpy.data.worlds.new(name+' studio atmosphere');scene.world.color=(0,0,0)
 image=bpy.data.images.load(os.path.join(ROOT,'assets','studio',name+'-plate.png'),check_existing=True);image.pack()
 material=bpy.data.materials.new(name+' painted lighting');material.use_nodes=True
 nodes=material.node_tree.nodes;nodes.clear();tex=nodes.new('ShaderNodeTexImage');tex.image=image
 emission=nodes.new('ShaderNodeEmission');emission.inputs['Strength'].default_value=1
 out=nodes.new('ShaderNodeOutputMaterial');material.node_tree.links.new(tex.outputs['Color'],emission.inputs['Color']);material.node_tree.links.new(emission.outputs[0],out.inputs['Surface'])
 verts=[];uvs=[];faces=[];nx=144;ny=81
 for y in range(ny+1):
  for x in range(nx+1):
   u=x/nx;v=y/ny;z=depth(name,u,v)*.75
   verts.append(((u-.5)*W*(NEUTRAL-z)/NEUTRAL*1.07,(v-.5)*H*(NEUTRAL-z)/NEUTRAL*1.07,z));uvs.append((u,v))
 for y in range(ny):
  for x in range(nx):
   a=y*(nx+1)+x;faces.append((a,a+1,a+nx+2,a+nx+1))
 mesh=bpy.data.meshes.new(name+' projection surface');mesh.from_pydata(verts,[],faces);mesh.update()
 uv=mesh.uv_layers.new(name='Matte painting UV')
 for poly in mesh.polygons:
  for idx in poly.loop_indices:uv.data[idx].uv=uvs[mesh.loops[idx].vertex_index]
 obj=bpy.data.objects.new(name+' painted depth stage',mesh);scene.collection.objects.link(obj);obj.data.materials.append(material)
 obj['art_method']='Generated matte painting on an authored shallow camera-projection surface. Not a fully modeled replacement set.'
 camera_data=bpy.data.cameras.new(name+' studio camera');camera_data.sensor_fit='VERTICAL';camera_data.sensor_height=24;camera_data.lens=24/(2*math.tan(math.radians(FOV/2)))
 camera=bpy.data.objects.new(name+' studio camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
 for frame,t in [(1,0),(120,.5),(240,1)]:
  scene.frame_set(frame);camera.location=((t-.5)*[.16,.3,.23,.12,.26][number],(t-.5)*(.3 if name=='climb' else .05),NEUTRAL-t*.14)
  camera.rotation_euler=(Vector((0,0,.1))-camera.location).to_track_quat('-Z','Y').to_euler();camera.rotation_euler.rotate_axis('Z',(t-.5)*(.022 if name=='climb' else .003))
  camera.keyframe_insert(data_path='location');camera.keyframe_insert(data_path='rotation_euler')
 scene['source_plate']=name+'-plate.png';scene['motion_type']='Bounded camera projection / 2.5D illustration'
 scene.frame_set(120);scene.render.filepath=os.path.join(ROOT,'qa','studio',name+'-blender.png');bpy.ops.render.render(write_still=True)
 print('STUDIO_SET_COMPLETE',name,flush=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','sunflower-studio.blend'))
print('STUDIO_BLEND_COMPLETE',flush=True)
