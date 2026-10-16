# Five original sets and baked moving cameras, inspired by inspected Sunflower frames.
import bpy, math, os, random, runpy
from mathutils import Vector
os.environ['STORY_SKIP_RENDER']='1'
source=runpy.run_path(os.path.join(os.path.dirname(__file__),'create_scene.py'))
for key in ['box','rod','sphere','mat','brick','ink','stone','trim','glass','lit','paper','walk','green','red','skin','denim','bricks']:
 globals()[key]=source[key]
ROOT=source['ROOT']; OUT=os.path.join(ROOT,'assets','frames'); os.makedirs(OUT,exist_ok=True)
random.seed(31)
street=bpy.context.scene; street.name='02 Brownstone street'
FRAMES=12
sets=[]

def configure(scene):
 scene.render.engine='CYCLES'; scene.cycles.samples=8; scene.cycles.use_denoising=True; scene.cycles.device=source['scene'].cycles.device
 scene.render.resolution_x=1120; scene.render.resolution_y=700; scene.render.resolution_percentage=100
 scene.render.image_settings.file_format='JPEG'; scene.render.image_settings.quality=88; scene.render.fps=24; scene.frame_end=FRAMES
 scene.view_settings.view_transform='Standard'

def new_set(name,sky,keycolor,keyenergy=2):
 scene=bpy.data.scenes.new(name); bpy.context.window.scene=scene; configure(scene)
 world=bpy.data.worlds.new(name+' atmosphere'); world.use_nodes=True; scene.world=world; world.node_tree.nodes['Background'].inputs[0].default_value=(*sky,1); world.node_tree.nodes['Background'].inputs[1].default_value=.45
 data=bpy.data.lights.new(name+' key','SUN'); data.energy=keyenergy; data.color=keycolor; data.angle=.08
 o=bpy.data.objects.new(name+' key',data); scene.collection.objects.link(o); o.rotation_euler=(.75,-.4,-.5)
 data=bpy.data.lights.new(name+' fill','AREA'); data.energy=650; data.color=(.4,.5,1); data.size=10
 o=bpy.data.objects.new(name+' fill',data); scene.collection.objects.link(o); o.location=(0,-1,9)
 data=bpy.data.cameras.new(name+' camera'); camera=bpy.data.objects.new(name+' camera',data); scene.collection.objects.link(camera); scene.camera=camera; data.lens=30; data.clip_end=250
 return scene

def text(name,body,loc,size,material,rotation=(math.pi/2,0,0)):
 c=bpy.data.curves.new(name,'FONT'); c.body=body; c.align_x='CENTER'; c.size=size; c.extrude=.003
 if source['font']: c.font=source['font']
 o=bpy.data.objects.new(name,c); bpy.context.collection.objects.link(o); o.location=loc; o.rotation_euler=rotation; o.data.materials.append(material); return o

def figure(x,y,z=0,pose='stand'):
 before=set(bpy.context.scene.objects)
 if pose=='climb':
  sphere('Climber torso',(x,y,z+1),(.28,.18,.4),red); sphere('Climber head',(x,y-.04,z+1.6),(.18,.18,.24),ink)
  rod('Reaching arm',(x-.24,y,z+1.25),(x-.47,y+.12,z+1.9),.08,red); rod('Reaching arm',(x+.24,y,z+1.25),(x+.5,y+.12,z+1.65),.08,red)
  rod('Climber leg',(x-.1,y,z+.8),(x-.4,y-.2,z+.12),.1,denim); rod('Climber leg',(x+.1,y,z+.8),(x+.38,y-.15,z+.4),.1,denim)
 else:
  sphere('Figure torso',(x,y,z+1.3),(.28,.19,.42),red); sphere('Figure head',(x,y,z+1.88),(.17,.17,.23),skin); sphere('Figure hair',(x,y,z+2),(.18,.18,.13),ink)
  for sign in [-1,1]:
   rod('Figure arm',(x+sign*.24,y,z+1.5),(x+sign*.36,y,z+.98),.08,red); rod('Figure leg',(x+sign*.13,y,z+.95),(x+sign*.15,y,z+.18),.1,denim); box('Figure shoe',(x+sign*.15,y-.08,z+.12),(.23,.4,.18),ink)
 root=bpy.data.objects.new('Character motion root',None); bpy.context.collection.objects.link(root)
 for o in set(bpy.context.scene.objects)-before:
  if o!=root: o.parent=root
 return root

# 1. Bedroom: intimate origin, desk glow, bed, headphones and skyline window.
bedroom=new_set('01 Bedroom',(.14,.08,.26),(1,.48,.22),1.5)
plaster=mat('Dusty violet plaster',(.28,.19,.33)); wood=mat('Warm wood',(.36,.15,.10)); bedding=mat('Red blanket',(.55,.075,.12)); blue=mat('Blue bedding',(.07,.12,.3))
box('Room floor',(0,2,-.12),(13,12,.2),wood); box('Back wall',(0,6,3.5),(13,.2,7),plaster); box('Right wall',(6.5,2,3.5),(.2,8,7),plaster)
for yy in range(-3,7): box('Floor ink joins',(0,yy,.001),(13,.022,.008),ink)
# Window on the back wall with exterior depth.
box('Window surround',(2.7,5.81,4.1),(3.7,.35,3.4),ink); box('Window blue glass',(2.7,5.59,4.1),(3.35,.05,3.02),glass)
for xx in [1.1,2.7,4.3]: box('Window frame',(xx,5.49,4.1),(.08,.16,3.1),trim)
box('Window cross',(2.7,5.47,4.1),(3.4,.14,.08),trim)
for i in range(7): box('Window skyline',(1.3+i*.45,5.53,3.1+random.random()*.3),(.3,.05,random.uniform(.4,1.4)),ink)
box('Window sill',(2.7,5.43,2.49),(3.8,.6,.15),trim)
box('Desk surface',(-3.2,4,1.8),(4.6,1.55,.17),wood)
for xx in [-5.1,-1.3]: box('Desk legs',(xx,4,.85),(.14,1.2,1.7),ink)
box('Monitor rim',(-3.2,4.36,2.62),(1.75,.17,1.08),ink); box('Monitor screen',(-3.2,4.25,2.62),(1.57,.025,.9),glass)
cyan=mat('Screen cyan',(.12,.7,1),1); pink=mat('Spray pink',(.85,.06,.3),.2)
for line in range(6): box('Editor line',(-3.5+random.random()*.25,4.22,2.9-line*.105),(random.uniform(.3,.95),.01,.025),cyan if line%2 else paper)
box('Monitor stem',(-3.2,4.35,2.05),(.12,.12,.4),ink); box('Keyboard',(-3.2,3.56,1.95),(1.45,.45,.07),ink)
box('Bed frame',(3,3.1,.55),(2.7,4.6,.8),ink); box('Mattress',(3,3.1,1.05),(2.65,4.5,.35),blue); box('Blanket',(3,2.5,1.29),(2.7,3.25,.16),bedding)
for xx in [2.1,2.4,3.7,4]: box('Blanket drawn fold',(xx,2.3,1.39),(.035,2.8,.02),ink)
box('Pillow',(3,4.65,1.35),(1.9,.7,.25),paper)
box('Chair seat',(-3.2,2.6,1.08),(1,1,.18),green); box('Chair back',(-3.2,3.05,1.7),(1,.15,1.2),ink)
rod('Chair stem',(-3.2,2.6,.15),(-3.2,2.6,1),.07,ink)
for i in range(5): box('Books',(-4.55,4,1.96+i*.08),(.6,.5,.07),[red,paper,blue][i%3])
box('Notebook',(-1.8,3.75,1.95),(.65,.65,.06),paper)
for xx,body,col in [(-4.5,'MAKE',pink),(-1.4,'THINGS',cyan)]:
 box('Poster ink border',(xx,5.81,4.2),(2.2,.07,2.6),ink); box('Poster paper',(xx,5.76,4.2),(2.05,.02,2.45),col); text('Poster title',body,(xx,5.72,4.15),.46,paper)
# Lamp disk and warm pool.
rod('Desk lamp',(-1.6,4,1.92),(-1.6,4,2.7),.035,ink); sphere('Lamp shade',(-1.6,4,2.8),(.32,.3,.18),paper)
data=bpy.data.lights.new('Desk amber pool','POINT'); data.energy=90; data.color=(1,.35,.1); o=bpy.data.objects.new('Desk amber pool',data); bedroom.collection.objects.link(o); o.location=(-1.6,3.9,2.65)
sets.append(('bedroom',bedroom,(-2,-7,3.5),(0,3,2.8),(-1.15,-6,3.3),(.2,3.4,2.7),None))

# 2. Retain and animate the original street rather than rendering another still.
bpy.context.window.scene=street; configure(street)
walker=bpy.data.objects.new('Walking root',None); street.collection.objects.link(walker)
for o in street.objects:
 if o.name.startswith(('Figure shoes','Left leg','Right leg','Jacket','Head','Hair','Arm','Backpack')): o.parent=walker
sets.append(('street',street,(-.6,-14,3.7),(1.2,15,5.2),(-.1,-10,4.3),(1.5,13,3.9),walker))

# Front-facing brick walls need X/Z mapping.
front_brick=bricks[0].copy(); front_brick.name='Graffiti and climb front brick'
for node in front_brick.node_tree.nodes:
 if node.bl_idname=='ShaderNodeCombineXYZ':
  sep=next(n for n in front_brick.node_tree.nodes if n.bl_idname=='ShaderNodeSeparateXYZ')
  front_brick.node_tree.links.new(sep.outputs['X'],node.inputs['X'])

# 3. Graffiti hideout: original mural with cans large in the foreground.
graffiti=new_set('03 Graffiti hideout',(.025,.045,.1),(.42,.7,1),1.1)
box('Hideout floor',(0,2,-.15),(18,20,.3),walk); box('Mural brick wall',(0,5,4),(18,.5,8),front_brick)
for xx in [-7,7]: box('Concrete tunnel pier',(xx,2,4),(1.2,8,8),stone)
box('Overhead beam',(0,2,7.5),(15,1,.6),ink)
for i in range(28):
 xx=random.uniform(-5.8,5.8); zz=random.uniform(1,6.7)
 o=box('Layered mural stroke',(xx,4.71,zz),(random.uniform(.08,.3),.025,random.uniform(.7,3)),[cyan,pink,paper,blue][i%4]); o.rotation_euler[1]=random.uniform(-.65,.65)
text('Mural BUILD','BUILD',(0,4.63,4.2),2,paper); text('Mural FOR PEOPLE','FOR PEOPLE',(0,4.6,2.9),.92,cyan)
for xx,yy,size in [(-4,-1,.7),(-2.9,-.65,.5),(4,-.8,.8),(2.8,-1.7,.58)]:
 rod('Spray can',(xx,yy,.1),(xx,yy,size*1.7),size*.33,stone); rod('Can cap',(xx,yy,size*1.7),(xx,yy,size*1.9),size*.24,[pink,cyan,paper][int(abs(xx))%3]); box('Can label',(xx,yy-size*.34,size*.8),(size*.47,.025,size*.65),ink)
rod('Exposed pipe',(-6.2,4.3,.2),(-6.2,4.3,7),.13,ink); figure(4.7,3.8)
sets.append(('graffiti',graffiti,(-1,-7,2.1),(0,4.5,3.2),(.65,-5.8,2.65),(0,4.5,3.8),None))

# 4. Wall climb: a tall brick composition, upward tracking and an articulated climbing pose.
climb=new_set('04 Wall climb',(.17,.1,.3),(1,.59,.29),2)
box('Vertical brick tower',(0,5.3,10),(13,.5,23),front_brick)
for zz in [2,6,10,14,18]:
 for xx in [-4.4,4.4]:
  box('Window surround',(xx,4.96,zz),(2.1,.15,2.5),trim); box('Wall window',(xx,4.84,zz),(1.7,.06,2.1),glass); box('Window line',(xx,4.77,zz),(.06,.08,2.1),ink)
 box('Facade band',(0,4.93,zz+1.65),(13,.2,.15),stone)
climber=figure(2,4.48,6,'climb')
text('Wall stencil','KEEP\nGOING.',(-1.8,4.98,8),1.9,paper)
sets.append(('climb',climb,(-1,-7,7),(0,5,9.5),(.2,-5,10),(0,5,12),climber))

# 5. Snowy city: blue atmospheric buildings and a quiet rooftop perch.
night=new_set('05 Snowy city',(.025,.045,.16),(.35,.48,1),.7)
nightstone=mat('Midnight city',(.035,.06,.13)); snow=mat('Snow',(.48,.62,.8)); windowwarm=mat('Distant warm windows',(.94,.5,.22),1.5)
box('Rooftop',(0,0,-.3),(18,14,.5),nightstone); box('Snow roof',(0,0,-.04),(18,14,.025),snow)
box('Rooftop parapet',(0,5,.45),(18,.45,.9),nightstone); box('Parapet snow',(0,5,.92),(18,.5,.07),snow)
for xx in [-6.5,6.5]: box('Near building',(xx,18,7),(4,8,19),nightstone)
for i in range(35):
 xx=random.uniform(-30,30); yy=random.uniform(20,70); h=random.uniform(6,25)
 box('Night skyline',(xx,yy,h/2-3),(random.uniform(2,4),4,h),nightstone)
 for z in range(0,int(h)-5,2):
  for dx in [-.6,.6]:
   if random.random()<.65: box('City window',(xx+dx,yy-2.02,z),(.3,.02,.55),windowwarm if i%3==0 else cyan)
for xx in [-5,5]:
 rod('Roof rail',(xx,4.7,.8),(xx,4.7,2),.04,ink)
rod('Roof rail top',(-5,4.7,2),(5,4.7,2),.035,ink)
figure(4.2,3.9)
# Tank silhouette brings depth above the skyline.
rod('Water tower tank',(-6,2,3.5),(-6,2,6),1.1,nightstone)
for xx in [-6.7,-5.3]: rod('Tank legs',(xx,2,.2),(xx,2,3.5),.06,ink)
sets.append(('night',night,(-1,-8,3.3),(0,25,7.2),(0,-6,3.8),(1,27,8),None))

# Save all five editable scenes and render camera/character frame sequences.
for name,scene,start,target,end,endtarget,actor in sets:
 bpy.context.window.scene=scene
 for i in range(FRAMES):
  t=i/(FRAMES-1); scene.frame_set(i+1)
  scene.camera.location=Vector(start).lerp(Vector(end),t)
  scene.camera.rotation_euler=(Vector(target).lerp(Vector(endtarget),t)-scene.camera.location).to_track_quat('-Z','Y').to_euler()
  if name=='climb': scene.camera.rotation_euler.rotate_axis('Z',math.radians(-4+8*t))
  scene.camera.keyframe_insert(data_path='location'); scene.camera.keyframe_insert(data_path='rotation_euler')
  if actor:
   actor.location=(0,1.3*t,.045*math.sin(t*math.tau*2)) if name=='street' else (0,0,1.7*t)
   actor.keyframe_insert(data_path='location')
  scene.render.filepath=os.path.join(OUT,f'{name}-{i:02d}.jpg'); bpy.ops.render.render(write_still=True)
  print(f'STORY_FRAME {name} {i+1}/{FRAMES}',flush=True)
 print('SET_COMPLETE',name,flush=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','sunflower-story.blend'))
print('FIVE_SCENES_COMPLETE',flush=True)
