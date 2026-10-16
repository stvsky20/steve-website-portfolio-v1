import bpy, math, random, os
from mathutils import Vector
random.seed(17)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS=os.path.join(ROOT,'assets')
os.makedirs(ASSETS,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine='CYCLES'
scene.cycles.samples=16
scene.cycles.device='GPU'
try:
 prefs=bpy.context.preferences.addons['cycles'].preferences
 prefs.compute_device_type='CUDA'; prefs.get_devices()
 for device in prefs.devices: device.use=device.type!='CPU'
 if not any(d.use for d in prefs.devices): scene.cycles.device='CPU'
except Exception: scene.cycles.device='CPU'
scene.cycles.use_denoising=True
scene.render.resolution_x=1600; scene.render.resolution_y=1000; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.view_settings.view_transform='Standard'
scene.world.color=(.12,.06,.2)
world=scene.world; world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.18,.09,.32,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.45

def mat(name,color,emission=0):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Roughness'].default_value=.86
 if emission: p.inputs['Emission Color'].default_value=(*color,1); p.inputs['Emission Strength'].default_value=emission
 return m
ink=mat('Ink / iron',(.022,.026,.06)); stone=mat('Warm stone',(.56,.34,.32)); trim=mat('Peach edges',(.75,.48,.37)); glass=mat('Blue window',(.045,.11,.19)); lit=mat('Amber windows',(.98,.49,.14),.65); paper=mat('Painted road words',(.94,.73,.39)); road=mat('Violet asphalt',(.075,.058,.12)); walk=mat('Pavement mauve',(.35,.26,.32)); white=mat('Crosswalk cream',(.71,.61,.56)); green=mat('Muted teal',(.1,.3,.27)); red=mat('Rust jacket',(.36,.045,.055)); skin=mat('Skin',(.35,.18,.105)); denim=mat('Dark blue trousers',(.025,.055,.1))

def brick(name,color):
 m=mat(name,color); n=m.node_tree.nodes; l=m.node_tree.links; p=n.get('Principled BSDF')
 tex=n.new('ShaderNodeTexBrick'); tex.inputs['Color1'].default_value=(*color,1); tex.inputs['Color2'].default_value=(color[0]*.7,color[1]*.68,color[2]*.8,1); tex.inputs['Mortar'].default_value=(.14,.085,.14,1); tex.inputs['Scale'].default_value=1.6; tex.inputs['Mortar Size'].default_value=.018; tex.inputs['Brick Width'].default_value=.65; tex.inputs['Row Height'].default_value=.25
 coord=n.new('ShaderNodeTexCoord'); sep=n.new('ShaderNodeSeparateXYZ'); comb=n.new('ShaderNodeCombineXYZ'); l.new(coord.outputs['Object'],sep.inputs[0]); l.new(sep.outputs['Y'],comb.inputs['X']); l.new(sep.outputs['Z'],comb.inputs['Y']); l.new(comb.outputs[0],tex.inputs['Vector']); l.new(tex.outputs['Color'],p.inputs['Base Color'])
 bump=n.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=.35; bump.inputs['Distance'].default_value=.08; l.new(tex.outputs['Fac'],bump.inputs['Height']); l.new(bump.outputs[0],p.inputs['Normal'])
 return m
bricks=[brick('Brick rose',(.55,.21,.2)),brick('Brick plum',(.29,.14,.27)),brick('Brick terracotta',(.63,.3,.23)),brick('Brick blue',(.23,.25,.4))]

def mesh_obj(name,verts,faces,loc,material):
 mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
 o=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(o); o.location=loc; o.data.materials.append(material); return o

def box(name,loc,size,material,bevel=0):
 x,y,z=[v/2 for v in size]
 verts=[(-x,-y,-z),(-x,-y,z),(-x,y,-z),(-x,y,z),(x,-y,-z),(x,-y,z),(x,y,-z),(x,y,z)]
 return mesh_obj(name,verts,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],loc,material)

def sphere(name,loc,scale,material):
 verts=[]; faces=[]; seg=12; rings=8
 for j in range(rings+1):
  angle=math.pi*j/rings
  for i in range(seg):
   az=math.tau*i/seg; verts.append((scale[0]*math.sin(angle)*math.cos(az),scale[1]*math.sin(angle)*math.sin(az),scale[2]*math.cos(angle)))
 for j in range(rings):
  for i in range(seg): faces.append((j*seg+i,j*seg+(i+1)%seg,(j+1)*seg+(i+1)%seg,(j+1)*seg+i))
 return mesh_obj(name,verts,faces,loc,material)

def rod(name,a,b,r,material):
 d=Vector(b)-Vector(a); length=d.length; verts=[]
 for z in [-length/2,length/2]:
  for i in range(8): verts.append((r*math.cos(math.tau*i/8),r*math.sin(math.tau*i/8),z))
 faces=[tuple(range(7,-1,-1)),tuple(range(8,16))]+[(i,(i+1)%8,(i+1)%8+8,i+8) for i in range(8)]
 o=mesh_obj(name,verts,faces,(Vector(a)+Vector(b))/2,material); o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); return o

box('Street',(0,24,-.16),(12,95,.3),road)
for side in [-1,1]:
 box('Raised sidewalk',(side*7.1,23,.03),(2.3,90,.24),walk)
 box('Curb edge',(side*5.94,23,.07),(.12,90,.3),trim)
 for yy in range(-12,67,2): box('Paving join',(side*7.1,yy,.155),(2.3,.018,.009),ink)
 for row in range(9):
  y=row*6+1; height=random.choice([11,13,15,16]); bm=bricks[(row+(side>0))%4]
  box('Brownstone building',(side*10,y,height/2),(7.9,5.8,height),bm)
  box('Foundation',(side*6.01,y,.6),(.22,5.7,1.1),stone)
  for z in [3.1,6,8.9,11.8,14.7]:
   if z>height-1: continue
   box('Floor band',(side*5.94,y,z-1.3),(.22,5.8,.13),trim)
   for wy in [y-1.8,y,y+1.8]:
    box('Window ink frame',(side*5.89,wy,z),(.12,1.27,1.87),ink)
    box('Window stone surround',(side*5.82,wy,z),(.15,1.14,1.72),trim)
    box('Window glass',(side*5.72,wy,z),(.08,.92,1.48),lit if random.random()<.28 else glass)
    box('Window mullion',(side*5.66,wy,z),(.12,.055,1.5),ink)
    box('Window crossbar',(side*5.66,wy,z),(.12,.94,.065),ink)
    box('Window sill',(side*5.57,wy,z-.82),(.43,1.4,.13),stone)
  box('Cornice shadow',(side*5.87,y,height-.2),(.5,5.9,.23),ink)
  box('Cornice cap',(side*5.8,y,height),(.6,6,.15),trim)
  # One door and stepped entrance per building.
  box('Door frame',(side*5.81,y,.98),(.25,1.35,2.55),trim)
  box('Deep teal door',(side*5.65,y,1.14),(.15,1.03,2.22),green)
  box('Door inset',(side*5.55,y,1.52),(.05,.75,.65),glass)
  for s in range(4): box('Stoop step',(side*(4.6+s*.27),y,.12+s*.12),(.65,1.8,.24+s*.24),stone)
  for dy in [-.92,.92]:
   rod('Stoop rail',(side*4.25,y+dy,.8),(side*5.7,y+dy,1.5),.035,ink)
   for dx in [4.35,4.8,5.3]: rod('Rail picket',(side*dx,y+dy,.35),(side*dx,y+dy,1.25),.018,ink)
  # Fire escape with outline rails and a diagonal staircase.
  if row%2==0:
   for z in [5,8,11]:
    if z>height: continue
    box('Fire escape platform',(side*5.2,y+1,z),(.95,2.3,.08),ink)
    for sy in [y-.15,y+2.15]: rod('Balcony rail',(side*4.73,sy,z),(side*4.73,sy,z+.9),.026,ink)
    rod('Balcony top',(side*4.73,y-.15,z+.9),(side*4.73,y+2.15,z+.9),.025,ink)
    for sy in [y+.2,y+.6,y+1,y+1.4,y+1.8]: rod('Balcony picket',(side*4.73,sy,z),(side*4.73,sy,z+.9),.014,ink)
    if z<10:
     rod('Escape stair stringer',(side*4.8,y-.1,z),(side*4.8,y+2.1,z+3),.05,ink)
     for k in range(10): box('Escape stair',(side*5,y-.1+k*.22,z+k*.3),(.6,.26,.06),ink)
 # Street lamps.
 for yy in [1,15,29,43]:
  rod('Lamppost',(side*5.15,yy,.15),(side*5.15,yy,5.7),.065,ink)
  rod('Lamp arm',(side*5.15,yy,5.7),(side*4.6,yy,5.7),.07,ink)
  box('Lamp housing',(side*4.6,yy,5.55),(.4,.45,.36),ink,.03)
  box('Lamp luminous face',(side*4.6,yy,5.39),(.32,.35,.025),lit)
 # Fence and service details.
 for yy in [7,19,31]:
  box('Utility box',(side*5.25,yy,.75),(.5,.7,1.1),green,.04)

# Crosswalk and central paint, with broken worn marks.
for x in [-4.7,-3.2,-1.7,-.2,1.3,2.8,4.3]: box('Crosswalk stripe',(x,-4,.006),(.85,3.4,.015),white)
for y in range(0,65,5):
 for x in [-.13,.13]: box('Center road stripe',(x,y,.008),(.06,2.5,.014),paper)
for i in range(100):
 x=random.uniform(-5.6,5.6); y=random.uniform(-7,45)
 box('Asphalt scratch',(x,y,.009),(random.uniform(.03,.2),random.uniform(.03,.5),.006),walk if i%4==0 else ink)
# Original world-space lettering, not song lyrics.
font_path='C:/Windows/Fonts/impact.ttf'
font=bpy.data.fonts.load(font_path) if os.path.exists(font_path) else None
for text,y,size in [('IDEAS',1.9,1.25),('INTO REALITY',.4,.77)]:
 c=bpy.data.curves.new('Street painted type','FONT'); c.body=text; c.align_x='CENTER'; c.size=size; c.extrude=.001
 if font: c.font=font
 o=bpy.data.objects.new(text,c); bpy.context.collection.objects.link(o); o.location=(0,y,.025); o.data.materials.append(paper)

# Simplified original walking figure; a silhouette study, not a finished character asset.
x,y=3.75,3.5
box('Figure shoes',(x-.13,y-.06,.13),(.24,.43,.2),ink,.04); box('Figure shoes',(x+.15,y+.2,.13),(.24,.43,.2),ink,.04)
rod('Left leg',(x-.13,y,.23),(x-.13,y,1),.1,denim); rod('Right leg',(x+.15,y+.2,.23),(x+.13,y,1),.1,denim)
sphere('Jacket',(x,y,1.32),(.3,.2,.45),red); sphere('Head',(x,y,1.91),(.18,.17,.23),skin); sphere('Hair',(x,y+.01,2.04),(.19,.18,.15),ink)
rod('Arm',(x-.27,y,1.55),(x-.36,y-.12,1.05),.085,red); rod('Arm',(x+.27,y,1.55),(x+.36,y+.12,1.08),.085,red)
sphere('Backpack',(x,y+.23,1.35),(.25,.14,.32),paper)
# Parked car creates a foreground silhouette.
box('Parked car body',(-3.8,8,.72),(1.55,3.9,.75),green,.16); box('Car roof',(-3.8,8.05,1.31),(1.37,1.8,.65),ink,.12)
for xx in [-4.6,-3]:
 for yy in [6.8,9.2]:
  o=rod('Car wheel',(xx-.1,yy,.43),(xx+.1,yy,.43),.36,ink)
# Distant city stacks.
for i in range(20):
 x=random.uniform(-16,16); y=random.uniform(59,75); h=random.uniform(9,26)
 box('Distant skyline',(x,y,h/2),(random.uniform(1.5,3.5),3,h),bricks[3] if i%2 else bricks[1])
# Warm low sunlight plus cool broad fill.
bpy.ops.object.light_add(type='SUN',location=(-12,-6,18)); sun=bpy.context.object; sun.name='Amber evening sun'; sun.rotation_euler=(math.radians(58),math.radians(-25),math.radians(-55)); sun.data.energy=2.2; sun.data.color=(1,.55,.3); sun.data.angle=.035
bpy.ops.object.light_add(type='AREA',location=(0,8,17)); light=bpy.context.object; light.name='Blue sky fill'; light.data.energy=1800; light.data.color=(.42,.44,1); light.data.shape='DISK'; light.data.size=20
bpy.ops.object.camera_add(); camera=bpy.context.object; camera.name='Story camera'; scene.camera=camera; camera.data.lens=30; camera.data.clip_end=200
shots=[('street-intro',(-.6,-14,3.7),(1.2,15,5.2)),('street-work',(-.2,-11,5.7),(0,7,1.3)),('street-close',(1.1,-10,3.3),(3.7,8,4.7))]
if os.environ.get('STORY_SKIP_RENDER') != '1':
 for name,pos,target in shots:
  camera.location=pos; camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
  scene.render.filepath=os.path.join(ASSETS,name+'.png')
  bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'blender','sunflower-street.blend'))
  bpy.ops.render.render(write_still=True)
  print('RENDERED',name,flush=True)
 print('SCENE_COMPLETE',flush=True)
