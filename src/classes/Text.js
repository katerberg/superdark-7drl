import * as Phaser from 'phaser';

export class Text extends Phaser.GameObjects.Text {
  start;
  end;

  constructor({scene, x, y, text}) {
    super(scene, x, y, text, {
      fontSize: 'calc(100vw / 25)',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 4,
    });

    this.setOrigin(0, 0);

    scene.add.existing(this);
  }
}
